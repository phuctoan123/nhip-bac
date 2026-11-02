const { supabaseRequest } = require("./_lib/supabase");

function json(res, status, data) {
  res.status(status).setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(data));
}

function publicReview(row) {
  return {
    id: String(row.id || ""),
    name: String(row.name || ""),
    content: String(row.content || ""),
    rating: Number.isInteger(row.rating) && row.rating >= 1 && row.rating <= 5 ? row.rating : 5,
    language: row.language === "en" ? "en" : "vi",
    review_date: row.review_date || null,
    status: "published",
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const result = await supabaseRequest(
      "reviews?status=eq.published&select=id,name,content,rating,language,review_date,status,created_at,updated_at&order=review_date.desc.nullslast,created_at.desc",
    );
    if (!result.response.ok) return json(res, 502, { error: "Không thể tải đánh giá." });
    const rows = Array.isArray(result.data)
      ? result.data.filter((row) => row && row.status === "published" && row.name && row.content).map(publicReview)
      : [];
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return json(res, 200, rows);
  } catch (error) {
    console.error("Public reviews API error", error);
    return json(res, 503, { error: "Đánh giá chưa sẵn sàng." });
  }
};
