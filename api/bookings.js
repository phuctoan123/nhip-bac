const crypto = require("crypto");
const { supabaseRequest } = require("./_lib/supabase");

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

const clean = (value, max = 500) => String(value || "").trim().slice(0, max);
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

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

module.exports = async function handler(req, res) {
  const origin = process.env.APP_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
      console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in the active Vercel deployment");
      return json(res, 500, { error: "Server chưa nhận được biến môi trường database." });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
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
