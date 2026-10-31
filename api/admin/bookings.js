const crypto = require("crypto");
const { supabaseRequest } = require("../_lib/supabase");

function verifyToken(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !process.env.ADMIN_SESSION_SECRET) return false;
  const expected = crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(payload).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  return data.exp > Date.now();
}

const json = (res, status, data) => res.status(status).json(data);

module.exports = async function handler(req, res) {
  if (!verifyToken(req)) return json(res, 401, { error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const result = await supabaseRequest("bookings?select=*&order=created_at.desc");
      if (!result.response.ok) return json(res, 502, { error: "Không thể tải booking." });
      return json(res, 200, result.data);
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const id = String(body.id || req.query?.id || "");
    if (!id) return json(res, 400, { error: "Thiếu booking id." });

    if (req.method === "PATCH") {
      const update = {};
      if (body.status) update.status = body.status;
      if (body.adminNote !== undefined) update.admin_note = String(body.adminNote).slice(0, 2000);
      const result = await supabaseRequest(`bookings?id=eq.${encodeURIComponent(id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(update) });
      if (!result.response.ok) return json(res, 502, { error: "Không thể cập nhật booking." });
      return json(res, 200, result.data?.[0] || null);
    }

    if (req.method === "DELETE") {
      const result = await supabaseRequest(`bookings?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!result.response.ok) return json(res, 502, { error: "Không thể xóa booking." });
      return json(res, 200, { success: true });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Admin booking API error", error);
    return json(res, 500, { error: "Lỗi server." });
  }
};
