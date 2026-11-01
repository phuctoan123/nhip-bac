const crypto = require("crypto");
const { supabaseRequest } = require("../_lib/supabase");

function verifyToken(req) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !process.env.ADMIN_SESSION_SECRET) return false;
  try {
    const expected = crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(payload).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

function cleanPhone(value) {
  return String(value || "").trim().replace(/[^0-9+().\-\s]/g, "").slice(0, 25);
}

function cleanPhones(value) {
  const source = Array.isArray(value) ? value : [];
  const ids = ["dung", "chau"];
  return ids.map((id, index) => {
    const item = source.find((candidate) => candidate?.id === id) || source[index] || {};
    const label = String(item.label || "").trim().slice(0, 60);
    const number = cleanPhone(item.number);
    if (!label || !/^[0-9+().\-\s]{8,25}$/.test(number)) return null;
    return { id, label, number };
  });
}

module.exports = async function handler(req, res) {
  if (!verifyToken(req)) return json(res, 401, { error: "Unauthorized" });

  try {
    if (req.method === "GET") {
      const result = await supabaseRequest("site_settings?key=eq.contact_phones&select=key,value,updated_at");
      if (!result.response.ok) return json(res, 502, { error: "Không thể tải cấu hình liên hệ." });
      return json(res, 200, result.data?.[0] || { key: "contact_phones", value: { phones: [{ id: "dung", label: "Ms. Dung", number: "0934013486" }, { id: "chau", label: "Ms. Châu", number: "0356735783" }] } });
    }

    if (req.method !== "PATCH") return json(res, 405, { error: "Method not allowed" });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const phones = cleanPhones(body.phones);
    if (!phones || phones.length !== 2) return json(res, 400, { error: "Vui lòng nhập đủ hai số điện thoại hợp lệ." });

    const result = await supabaseRequest("site_settings?on_conflict=key", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ key: "contact_phones", value: { phones }, updated_at: new Date().toISOString() }),
    });
    if (!result.response.ok) return json(res, 502, { error: "Không thể lưu số điện thoại." });
    return json(res, 200, result.data?.[0] || { key: "contact_phones", value: { phones } });
  } catch (error) {
    console.error("Admin settings API error", error);
    return json(res, 500, { error: "Lỗi server cấu hình liên hệ." });
  }
};
