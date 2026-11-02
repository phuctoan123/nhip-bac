const crypto = require("crypto");
const { supabaseRequest } = require("../_lib/supabase");

const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (value) => crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("base64url");
const LEGACY_SHA256 = /^[a-f0-9]{64}$/i;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 32 * 1024 * 1024 };

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function verifyPassword(password, configuredHash) {
  if (LEGACY_SHA256.test(configuredHash)) {
    console.warn("ADMIN_PASSWORD_HASH đang dùng SHA-256 legacy; hãy chuyển sang định dạng scrypt.");
    return safeEqual(crypto.createHash("sha256").update(password).digest("hex"), configuredHash.toLowerCase());
  }
  const [scheme, saltHex, hashHex] = String(configuredHash).split("$");
  if (scheme !== "scrypt" || !/^[a-f0-9]+$/i.test(saltHex || "") || !/^[a-f0-9]+$/i.test(hashHex || "") || saltHex.length % 2 || hashHex.length % 2) return false;
  try {
    const derived = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), hashHex.length / 2, SCRYPT_OPTIONS);
    return safeEqual(derived, Buffer.from(hashHex, "hex"));
  } catch {
    return false;
  }
}

function parseBody(req) {
  if (typeof req.body !== "string") return req.body || {};
  try {
    return JSON.parse(req.body || "{}");
  } catch {
    return null;
  }
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
  return String(forwarded).split(",")[0].trim() || "unknown";
}

function ipHash(req) {
  return crypto.createHash("sha256").update(clientIp(req)).digest("hex");
}

async function prepareLoginRateLimit(hash) {
  const now = Date.now();
  const windowStart = new Date(now - 15 * 60 * 1000).toISOString();
  const cleanupBefore = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const cleanup = await supabaseRequest(`admin_login_attempts?attempted_at=lt.${encodeURIComponent(cleanupBefore)}`, { method: "DELETE" });
  if (!cleanup.response.ok) throw new Error("Login rate limit cleanup failed");
  const result = await supabaseRequest(`admin_login_attempts?ip_hash=eq.${encodeURIComponent(hash)}&attempted_at=gte.${encodeURIComponent(windowStart)}&select=attempted_at&order=attempted_at.asc`);
  if (!result.response.ok) throw new Error("Login rate limit query failed");
  const attempts = Array.isArray(result.data) ? result.data : [];
  if (attempts.length >= 5) {
    const oldest = new Date(attempts[0]?.attempted_at || now).getTime();
    return { blocked: true, retryAfter: Math.max(1, Math.ceil((oldest + 15 * 60 * 1000 - now) / 1000)) };
  }
  return { blocked: false };
}

async function recordFailedLogin(hash) {
  const result = await supabaseRequest("admin_login_attempts", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ ip_hash: hash }),
  });
  if (!result.response.ok) throw new Error("Login rate limit insert failed");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = parseBody(req);
  if (body === null) return res.status(400).json({ error: "JSON không hợp lệ." });
  const username = String(body.username || "");
  const password = String(body.password || "");
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;

  if (!process.env.ADMIN_SESSION_SECRET || !configuredHash) return res.status(500).json({ error: "Admin auth chưa được cấu hình." });
  const hashedIp = ipHash(req);
  try {
    const rate = await prepareLoginRateLimit(hashedIp);
    if (rate.blocked) {
      res.setHeader("Retry-After", String(rate.retryAfter));
      return res.status(429).json({ error: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút." });
    }
  } catch (error) {
    console.error("Admin login rate limit error", error);
    return res.status(503).json({ error: "Không thể kiểm tra giới hạn đăng nhập. Vui lòng thử lại sau." });
  }

  const valid = username === (process.env.ADMIN_USERNAME || "admin") && verifyPassword(password, configuredHash);
  if (!valid) {
    try {
      await recordFailedLogin(hashedIp);
    } catch (error) {
      console.error("Admin login attempt write error", error);
      return res.status(503).json({ error: "Không thể ghi nhận lần thử đăng nhập. Vui lòng thử lại sau." });
    }
    return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng." });
  }

  const payload = encode({ sub: username, exp: Date.now() + 8 * 60 * 60 * 1000 });
  return res.status(200).json({ token: `${payload}.${sign(payload)}` });
};
