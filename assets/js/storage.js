/* Shared, versioned localStorage repository for the public site and Admin. */
(function () {
  const KEYS = {
    services: "nhipbac.services.v1",
    reviews: "nhipbac.reviews.v1",
    bookings: "nhipbac.bookings.v1",
  };
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
  const initialReviews = [
    [
      "Ngọc Hà",
      "Nhân viên nhẹ tay, thao tác kỹ. Không gian riêng tư nên mình rất thoải mái.",
    ],
    ["Phương Linh", "Dịch vụ đúng giờ, giá rõ ràng. Mình sẽ quay lại khi cần."],
    ["Hữu Đức", "Kết quả tự nhiên, không phải nhuộm nên rất hợp với mình."],
    ["Bảo Trân", "Chat Zalo xác nhận nhanh, địa chỉ dễ tìm ở Phú Mỹ Hưng."],
    ["Minh Quân", "Mình thích nhất là cảm giác sạch sẽ và chu đáo."],
    ["Diễm My", "Nhổ tóc bạc rất tỉ mỉ, sau đó nhìn tóc gọn hơn hẳn."],
  ].map((x, i) => ({
    id: `review-${i + 1}`,
    name: x[0],
    content: x[1],
    rating: 5,
    language: "vi",
    reviewDate: "2024-01-01",
    status: "published",
    createdAt: now(),
    updatedAt: now(),
  }));
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
  function repo(key, fallback) {
    return {
      all: () => read(key, fallback),
      save: (items) => write(key, items),
      add(item) {
        const a = read(key, fallback);
        a.push(item);
        return write(key, a);
      },
      update(item) {
        const a = read(key, fallback);
        const i = a.findIndex((x) => x.id === item.id);
        if (i < 0) return false;
        a[i] = { ...a[i], ...item, updatedAt: now() };
        return write(key, a);
      },
      remove(id) {
        return write(
          key,
          read(key, fallback).filter((x) => x.id !== id),
        );
      },
    };
  }
  window.NhipBacStore = {
    KEYS,
    now,
    id,
    services: repo(KEYS.services, initialServices),
    reviews: repo(KEYS.reviews, initialReviews),
    bookings: repo(KEYS.bookings, []),
  };
})();
