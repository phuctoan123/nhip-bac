const { supabaseRequest } = require("../_lib/supabase");
const { verifyToken } = require("../_lib/auth");

const json = (res, status, data) => res.status(status).json(data);
const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const text = (value, max) => String(value ?? "").trim().slice(0, max);
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/;

function parseBody(req) {
  if (typeof req.body !== "string") return req.body || {};
  try {
    return JSON.parse(req.body || "{}");
  } catch {
    return null;
  }
}

function readBoolean(value) {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return null;
}

function validateService(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { error: "Body không hợp lệ." };
  const data = {};
  const fields = [
    ["name_vi", "nameVi", 180],
    ["name_en", "nameEn", 180],
    ["description_vi", "descriptionVi", 2000],
    ["description_en", "descriptionEn", 2000],
    ["category", "category", 120],
    ["image", "image", 500],
    ["unit", "unit", 40],
    ["price_note", "priceNote", 240],
  ];
  for (const [dbKey, inputKey, max] of fields) {
    if (partial && !has(body, inputKey) && !has(body, dbKey)) continue;
    const raw = has(body, inputKey) ? body[inputKey] : body[dbKey];
    if (String(raw ?? "").length > max) return { error: `${inputKey} vượt quá ${max} ký tự.` };
    data[dbKey] = text(raw, max);
  }

  const id = has(body, "id") ? text(body.id, 100) : "";
  if (!partial || id) {
    if (!id || !idPattern.test(id)) return { error: "ID dịch vụ không hợp lệ." };
    data.id = id;
  }
  if (!partial && !data.name_vi) return { error: "Tên tiếng Việt là bắt buộc." };
  if (has(body, "price")) {
    const price = Number(body.price);
    if (!Number.isInteger(price) || price < 0) return { error: "Giá phải là số nguyên không âm." };
    data.price = price;
  } else if (!partial) data.price = 0;
  if (has(body, "sort_order") || has(body, "sortOrder")) {
    const sortOrder = Number(has(body, "sort_order") ? body.sort_order : body.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) return { error: "Thứ tự hiển thị không hợp lệ." };
    data.sort_order = sortOrder;
  } else if (!partial) data.sort_order = 1;
  if (has(body, "visible")) {
    const visible = readBoolean(body.visible);
    if (visible === null) return { error: "Trạng thái hiển thị không hợp lệ." };
    data.visible = visible;
  } else if (!partial) data.visible = true;

  if (!partial && (!data.unit || data.name_vi.length > 180)) return { error: "Thiếu thông tin dịch vụ bắt buộc." };
  return { data };
}

function bodyId(req, body) {
  return text(body?.id || req.query?.id, 100);
}

module.exports = async function handler(req, res) {
  if (!verifyToken(req)) return json(res, 401, { error: "Unauthorized" });
  try {
    if (req.method === "GET") {
      const result = await supabaseRequest("services?select=*&order=sort_order.asc,id.asc");
      if (!result.response.ok) return json(res, 502, { error: "Không thể tải dịch vụ." });
      return json(res, 200, Array.isArray(result.data) ? result.data : []);
    }

    const body = parseBody(req);
    if (body === null) return json(res, 400, { error: "JSON không hợp lệ." });
    if (req.method === "POST") {
      const parsed = validateService(body);
      if (parsed.error) return json(res, 400, parsed);
      const result = await supabaseRequest("services", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(parsed.data),
      });
      if (!result.response.ok) return json(res, result.response.status === 409 ? 409 : 502, { error: "Không thể tạo dịch vụ." });
      return json(res, 201, result.data?.[0] || null);
    }

    const id = bodyId(req, body);
    if (!id || !idPattern.test(id)) return json(res, 400, { error: "ID dịch vụ không hợp lệ." });
    if (req.method === "PATCH") {
      const parsed = validateService(body, true);
      if (parsed.error) return json(res, 400, parsed);
      delete parsed.data.id;
      if (!Object.keys(parsed.data).length) return json(res, 400, { error: "Không có dữ liệu cần cập nhật." });
      parsed.data.updated_at = new Date().toISOString();
      const result = await supabaseRequest(`services?id=eq.${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(parsed.data),
      });
      if (!result.response.ok) return json(res, 502, { error: "Không thể cập nhật dịch vụ." });
      return json(res, 200, result.data?.[0] || null);
    }
    if (req.method === "DELETE") {
      const result = await supabaseRequest(`services?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!result.response.ok) return json(res, 502, { error: "Không thể xóa dịch vụ." });
      return json(res, 200, { success: true });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Admin services API error", error);
    return json(res, 500, { error: "Lỗi server dịch vụ." });
  }
};
