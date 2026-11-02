const crypto = require("crypto");
const { supabaseRequest } = require("./_lib/supabase");

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

const clean = (value, max = 500) => String(value || "").trim().slice(0, max);
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RATE_LIMITS = { phone: { count: 3, windowMs: 10 * 60 * 1000 }, ip: { count: 10, windowMs: 60 * 60 * 1000 } };

function createBookingCode() {
  let suffix = "";
  for (let i = 0; i < 4; i += 1) suffix += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  return `NB-${suffix}`;
}

function validDate(value) {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date >= today;
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
  return String(forwarded).split(",")[0].trim() || "unknown";
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function phoneForRateLimit(phone) {
  return phone.replace(/\D/g, "") || phone.toLowerCase();
}

async function checkBookingRateLimit(ipHash, phoneHash) {
  const now = Date.now();
  const cleanupBefore = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const phoneSince = new Date(now - RATE_LIMITS.phone.windowMs).toISOString();
  const ipSince = new Date(now - RATE_LIMITS.ip.windowMs).toISOString();
  const cleanup = await supabaseRequest(`booking_rate_log?created_at=lt.${encodeURIComponent(cleanupBefore)}`, { method: "DELETE" });
  if (!cleanup.response.ok) throw new Error("Booking rate log cleanup failed");
  const [phoneResult, ipResult] = await Promise.all([
    supabaseRequest(`booking_rate_log?phone_hash=eq.${encodeURIComponent(phoneHash)}&created_at=gte.${encodeURIComponent(phoneSince)}&select=id`),
    supabaseRequest(`booking_rate_log?ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${encodeURIComponent(ipSince)}&select=id`),
  ]);
  if (!phoneResult.response.ok || !ipResult.response.ok) throw new Error("Booking rate log query failed");
  const phoneCount = Array.isArray(phoneResult.data) ? phoneResult.data.length : 0;
  const ipCount = Array.isArray(ipResult.data) ? ipResult.data.length : 0;
  if (phoneCount >= RATE_LIMITS.phone.count) return { blocked: true, retryAfter: Math.ceil(RATE_LIMITS.phone.windowMs / 1000), message: "Số điện thoại này đã đặt quá nhiều lịch trong 10 phút. Vui lòng thử lại sau hoặc gọi/Zalo trực tiếp cho Nhíp Bạc." };
  if (ipCount >= RATE_LIMITS.ip.count) return { blocked: true, retryAfter: Math.ceil(RATE_LIMITS.ip.windowMs / 1000), message: "Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau hoặc gọi/Zalo trực tiếp cho Nhíp Bạc." };
  return { blocked: false };
}

async function recordBookingRate(ipHash, phoneHash) {
  const result = await supabaseRequest("booking_rate_log", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ip_hash: ipHash, phone_hash: phoneHash }),
  });
  if (!result.response.ok) throw new Error("Booking rate log insert failed");
}

module.exports = async function handler(req, res) {
  const configuredOrigin = String(process.env.APP_ORIGIN || "").trim();
  const requestOrigin = String(req.headers.origin || "").trim();
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (!configuredOrigin && isProduction) return json(res, 500, { error: "Server chưa được cấu hình APP_ORIGIN." });
  if (configuredOrigin && requestOrigin && requestOrigin !== configuredOrigin) return json(res, 403, { error: "Origin không được phép." });
  if (configuredOrigin) res.setHeader("Access-Control-Allow-Origin", configuredOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in the active Vercel deployment");
      return json(res, 500, { error: "Server chưa nhận được biến môi trường database." });
    }

    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    } catch {
      return json(res, 400, { error: "JSON không hợp lệ." });
    }
    if (clean(body.website, 120)) return json(res, 201, { success: true });
    const formStartedAt = Number(body.formStartedAt);
    if (!Number.isFinite(formStartedAt) || Date.now() - formStartedAt < 3000) return json(res, 400, { error: "Vui lòng dành thêm một chút thời gian để hoàn tất form đặt lịch." });
    const customerName = clean(body.customerName, 120);
    const phone = clean(body.phone, 30);
    const serviceId = clean(body.serviceId, 100);
    const serviceNameSnapshot = clean(body.serviceNameSnapshot, 180);
    const preferredDate = clean(body.preferredDate, 20);
    const preferredTime = clean(body.preferredTime, 80);
    const message = clean(body.message, 1000);

    if (!customerName || !phone || !serviceNameSnapshot) return json(res, 400, { error: "Thiếu thông tin bắt buộc." });
    if (!/^[0-9+().\-\s]{8,25}$/.test(phone)) return json(res, 400, { error: "Số điện thoại không hợp lệ." });
    if (!validDate(preferredDate)) return json(res, 400, { error: "Ngày đặt lịch không hợp lệ." });

    const ipHash = hashValue(clientIp(req));
    const phoneHash = hashValue(phoneForRateLimit(phone));
    const rate = await checkBookingRateLimit(ipHash, phoneHash);
    if (rate.blocked) {
      res.setHeader("Retry-After", String(rate.retryAfter));
      return json(res, 429, { error: rate.message });
    }
    await recordBookingRate(ipHash, phoneHash);

    let result;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      result = await supabaseRequest("bookings", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          booking_code: createBookingCode(),
          customer_name: customerName,
          phone,
          service_id: serviceId || null,
          service_name_snapshot: serviceNameSnapshot,
          preferred_date: preferredDate || null,
          preferred_time: preferredTime || null,
          message: message || null,
          status: "new",
        }),
      });
      if (result.response.ok || result.response.status !== 409) break;
    }

    if (!result.response.ok) {
      console.error("Supabase booking error", result.data);
      return json(res, 502, { error: "Không thể lưu yêu cầu đặt lịch." });
    }

    const booking = result.data?.[0];
    return json(res, 201, { success: true, booking: { id: booking.id, bookingCode: booking.booking_code, status: booking.status, createdAt: booking.created_at } });
  } catch (error) {
    console.error("Booking API error", error);
    return json(res, 502, { error: "Không thể kết nối tới database." });
  }
};
