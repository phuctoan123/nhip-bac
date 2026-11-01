const { supabaseRequest } = require("./_lib/supabase");

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

const DEFAULT_PHONES = [
  { id: "dung", label: "Ms. Dung", number: "0934013486" },
  { id: "chau", label: "Ms. Châu", number: "0356735783" },
];

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const key = String(req.query?.key || "contact_phones");
  if (key !== "contact_phones" && key !== "contact_phone") return json(res, 400, { error: "Invalid setting key" });

  try {
    const result = await supabaseRequest(`site_settings?key=eq.${encodeURIComponent(key)}&select=key,value,updated_at`);
    if (!result.response.ok) return json(res, 502, { error: "Không thể tải cấu hình website." });
    const row = result.data?.[0] || (key === "contact_phones"
      ? { key, value: { phones: DEFAULT_PHONES } }
      : { key, value: { phone: DEFAULT_PHONES[0].number } });
    res.setHeader("Cache-Control", "no-store");
    return json(res, 200, row);
  } catch (error) {
    console.error("Public settings API error", error);
    return json(res, 503, { error: "Cấu hình website chưa sẵn sàng." });
  }
};
