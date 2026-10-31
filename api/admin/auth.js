const crypto = require("crypto");

const hash = (value) => crypto.createHash("sha256").update(value).digest("hex");
const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const sign = (value) => crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(value).digest("base64url");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  const username = String(body.username || "");
  const password = String(body.password || "");
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;

  if (!process.env.ADMIN_SESSION_SECRET || !configuredHash) return res.status(500).json({ error: "Admin auth chưa được cấu hình." });
  if (username !== (process.env.ADMIN_USERNAME || "admin") || hash(password) !== configuredHash) return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng." });

  const payload = encode({ sub: username, exp: Date.now() + 8 * 60 * 60 * 1000 });
  return res.status(200).json({ token: `${payload}.${sign(payload)}` });
};
