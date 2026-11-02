const { supabaseRequest } = require("./_lib/supabase");

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

function publicService(row) {
  return {
    id: String(row.id || ""),
    name_vi: String(row.name_vi || ""),
    name_en: String(row.name_en || ""),
    description_vi: String(row.description_vi || ""),
    description_en: String(row.description_en || ""),
    category: String(row.category || ""),
    image: String(row.image || ""),
    price: Number.isInteger(row.price) && row.price >= 0 ? row.price : 0,
    unit: String(row.unit || "phút"),
    price_note: String(row.price_note || ""),
    visible: row.visible === true,
    sort_order: Number.isInteger(row.sort_order) ? row.sort_order : 0,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const result = await supabaseRequest(
      "services?visible=eq.true&select=id,name_vi,name_en,description_vi,description_en,category,image,price,unit,price_note,visible,sort_order,created_at,updated_at&order=sort_order.asc,id.asc",
    );
    if (!result.response.ok) return json(res, 502, { error: "Không thể tải dịch vụ." });
    const rows = Array.isArray(result.data)
      ? result.data.filter((row) => row && row.visible === true && row.id && row.name_vi).map(publicService)
      : [];
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return json(res, 200, rows);
  } catch (error) {
    console.error("Public services API error", error);
    return json(res, 503, { error: "Dịch vụ chưa sẵn sàng." });
  }
};
