/* Shared, versioned localStorage repository for the public site and Admin. */
(function () {
  const KEYS = {
    services: "nhipbac.services.v1",
    reviews: "nhipbac.reviews.v1",
    bookings: "nhipbac.bookings.v1",
  };
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:";
  const memory = {};
  const remoteFallback = { services: isLocalPreview, reviews: isLocalPreview };
  const legacyReviewIds = new Set(["review-1", "review-2", "review-3", "review-4", "review-5", "review-6"]);
  const removeLegacyReviews = (items) => items.filter((item) => !(legacyReviewIds.has(item.id) && item.reviewDate === "2024-01-01"));
  const now = () => new Date().toISOString();
  const id = (prefix) =>
    `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const initialServices = [
    {
      id: "svc-grey-hair",
      nameVi: "Nhíp Bạc - Nhổ tóc bạc",
      nameEn: "Grey Hair Plucking",
      descriptionVi:
        "Dịch vụ nhổ tóc bạc thủ công, tập trung vào độ chính xác và cảm giác thoải mái.",
      descriptionEn:
        "Manual grey hair plucking focused on precision and comfort.",
      category: "Chăm sóc tóc",
      image: "assets/nhip-bac-images/poster-lam-viec.jpg",
      price: 2000,
      unit: "phút",
      priceNote: "Tính phí minh bạch theo thời gian",
      visible: true,
      sortOrder: 1,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "svc-japan-support",
      nameVi: "Hỗ trợ Visa & Du lịch Nhật Bản",
      nameEn: "Japan Visa & Travel Support",
      descriptionVi:
        "Tư vấn chuẩn bị hồ sơ và lịch trình cho khách hàng có kế hoạch du lịch Nhật Bản.",
      descriptionEn:
        "Practical guidance for guests preparing documents and itineraries for travel to Japan.",
      category: "Tư vấn",
      image: "assets/nhip-bac-images/post-visa.jpg",
      price: 0,
      unit: "gói",
      priceNote: "Liên hệ để được tư vấn",
      visible: true,
      sortOrder: 2,
      createdAt: now(),
      updatedAt: now(),
    },
  ];
  // Review mẫu đã được gỡ; production chỉ nhận review đã xuất bản từ Supabase.
  const initialReviews = [];
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value : fallback;
    } catch (e) {
      console.warn("Nhíp Bạc storage read failed", e);
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(
        new CustomEvent("nhipbac:data-updated", { detail: { key } }),
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  function repo(key, fallback, kind) {
    const current = () => {
      const items = Array.isArray(memory[kind]) ? memory[kind] : read(key, fallback);
      return kind === "reviews" ? removeLegacyReviews(items) : items;
    };
    const save = (items) => {
      memory[kind] = Array.isArray(items) ? items : [];
      if (isLocalPreview || remoteFallback[kind]) return write(key, memory[kind]);
      window.dispatchEvent(new CustomEvent("nhipbac:data-updated", { detail: { key } }));
      return true;
    };
    return {
      all: current,
      save,
      add(item) {
        const a = current();
        a.push(item);
        return save(a);
      },
      update(item) {
        const a = current();
        const i = a.findIndex((x) => x.id === item.id);
        if (i < 0) return false;
        a[i] = { ...a[i], ...item, updatedAt: now() };
        return save(a);
      },
      remove(id) {
        return save(current().filter((x) => x.id !== id));
      },
    };
  }

  const fromServiceApi = (x) => ({
    id: x.id,
    nameVi: x.name_vi || "",
    nameEn: x.name_en || "",
    descriptionVi: x.description_vi || "",
    descriptionEn: x.description_en || "",
    category: x.category || "",
    image: x.image || "",
    price: Number(x.price) || 0,
    unit: x.unit || "phút",
    priceNote: x.price_note || "",
    visible: x.visible === true,
    sortOrder: Number(x.sort_order) || 0,
    createdAt: x.created_at || now(),
    updatedAt: x.updated_at || now(),
  });
  const fromReviewApi = (x) => ({
    id: x.id,
    name: x.name || "",
    content: x.content || "",
    rating: Number(x.rating) || 5,
    language: x.language === "en" ? "en" : "vi",
    reviewDate: x.review_date || "",
    status: x.status || "pending",
    createdAt: x.created_at || now(),
    updatedAt: x.updated_at || now(),
  });
  async function hydrateRemote(kind, endpoint, mapper, fallback) {
    if (isLocalPreview) return;
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid API payload");
      memory[kind] = data.map(mapper);
      remoteFallback[kind] = false;
    } catch (error) {
      remoteFallback[kind] = true;
      memory[kind] = kind === "reviews" ? removeLegacyReviews(read(KEYS[kind], fallback)) : read(KEYS[kind], fallback);
      console.warn(`Nhíp Bạc ${kind} API unavailable; using local fallback`, error);
    }
  }
  const ready = Promise.all([
    hydrateRemote("services", "/api/services", fromServiceApi, initialServices),
    hydrateRemote("reviews", "/api/reviews", fromReviewApi, initialReviews),
  ]);
  window.NhipBacStore = {
    KEYS,
    now,
    id,
    isLocalPreview,
    ready,
    remote: { services: { fromApi: fromServiceApi }, reviews: { fromApi: fromReviewApi } },
    services: repo(KEYS.services, initialServices, "services"),
    reviews: repo(KEYS.reviews, initialReviews, "reviews"),
    bookings: repo(KEYS.bookings, [], "bookings"),
  };
})();
