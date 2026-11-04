const crypto = require("crypto");
const { supabaseRequest } = require("../_lib/supabase");
const { verifyToken } = require("../_lib/auth");

const json = (res, status, data) => res.status(status).json(data);
const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const text = (value, max) => String(value ?? "").trim().slice(0, max);
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;
const statuses = new Set(["draft", "pending", "published", "hidden"]);
const languages = new Set(["vi", "en"]);

function createReviewId() {
  return `review-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

function parseBody(req) {
  if (typeof req.body !== "string") return req.body || {};
  try {
    return JSON.parse(req.body || "{}");
  } catch {
    return null;
  }
}

function validateReview(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Body không hợp lệ." };
  const data = {};
  const fields = [["name", 120], ["content", 3000]];
  for (const [key, max] of fields) {
    if (partial && !has(body, key)) continue;
    if (String(body[key] ?? "").length > max) return { error: `${key} vượt quá ${max} ký tự.` };
    data[key] = text(body[key], max);
  }
  const id = has(body, "id") ? text(body.id, 100) : "";
  if (!partial || id) {
    if (!id || !idPattern.test(id)) return { error: "ID đánh giá không hợp lệ." };
    data.id = id;
  }
  if (!partial && (!data.name || !data.content)) return { error: "Tên và nội dung đánh giá là bắt buộc." };
  if (has(body, "rating")) {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Điểm đánh giá phải từ 1 đến 5." };
    data.rating = rating;
  } else if (!partial) data.rating = 5;
  if (has(body, "language")) {
    const language = text(body.language, 2);
    if (!languages.has(language)) return { error: "Ngôn ngữ đánh giá không hợp lệ." };
    data.language = language;
  } else if (!partial) data.language = "vi";
  if (has(body, "review_date") || has(body, "reviewDate")) {
    const reviewDate = text(has(body, "review_date") ? body.review_date : body.reviewDate, 10);
    if (reviewDate && !/^\d{4}-\d{2}-\d{2}$/.test(reviewDate)) return { error: "Ngày đánh giá không hợp lệ." };
    data.review_date = reviewDate || null;
  } else if (!partial) data.review_date = null;
  if (has(body, "status")) {
    const status = text(body.status, 20);
    if (!statuses.has(status)) return { error: "Trạng thái đánh giá không hợp lệ." };
    data.status = status;
  } else if (!partial) data.status = "pending";
  return { data };
}

function bodyId(req, body) {
  return text(body?.id || req.query?.id, 100);
}

module.exports = async function handler(req, res) {
  if (!verifyToken(req)) return json(res, 401, { error: "Unauthorized" });
  try {
    if (req.method === "GET") {
      const result = await supabaseRequest("reviews?select=*&order=review_date.desc.nullslast,created_at.desc");
      if (!result.response.ok) return json(res, 502, { error: "Không thể tải đánh giá." });
      return json(res, 200, Array.isArray(result.data) ? result.data : []);
    }
    const body = parseBody(req);
    if (body === null) return json(res, 400, { error: "JSON không hợp lệ." });
    if (req.method === "POST") {
      if (!body.id) body.id = createReviewId();
      const parsed = validateReview(body);
      if (parsed.error) return json(res, 400, parsed);
      const result = await supabaseRequest("reviews", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(parsed.data),
      });
      if (!result.response.ok) return json(res, result.response.status === 409 ? 409 : 502, { error: "Không thể tạo đánh giá." });
      return json(res, 201, result.data?.[0] || null);
    }
    const id = bodyId(req, body);
    if (!id || !idPattern.test(id)) return json(res, 400, { error: "ID đánh giá không hợp lệ." });
    if (req.method === "PATCH") {
      const parsed = validateReview(body, true);
      if (parsed.error) return json(res, 400, parsed);
      delete parsed.data.id;
      if (!Object.keys(parsed.data).length) return json(res, 400, { error: "Không có dữ liệu cần cập nhật." });
      parsed.data.updated_at = new Date().toISOString();
      const result = await supabaseRequest(`reviews?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(parsed.data),
      });
      if (!result.response.ok) return json(res, 502, { error: "Không thể cập nhật đánh giá." });
      return json(res, 200, result.data?.[0] || null);
    }
    if (req.method === "DELETE") {
      const result = await supabaseRequest(`reviews?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!result.response.ok) return json(res, 502, { error: "Không thể xóa đánh giá." });
      return json(res, 200, { success: true });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Admin reviews API error", error);
    return json(res, 500, { error: "Lỗi server đánh giá." });
  }
};
