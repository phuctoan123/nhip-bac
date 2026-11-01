(function () {
  const SESSION = "nhipbac.admin.session.v1",
    HASH = "9a4aabf0e5cf71cae2cea646613ce7e2a5919fa758e56819704be25a3a2c1f0b";
  const config = { username: "admin", passwordHash: HASH }; // Local fallback only. Production auth uses /api/admin/auth.
  const TOKEN = "nhipbac.admin.token.v1";
  let remoteBookingError = "";
  const app = document.getElementById("adminApp"),
    esc = (s) =>
      String(s ?? "").replace(
        /[&<>'"]/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;",
          })[c],
      );
  const money = (n) =>
    n ? new Intl.NumberFormat("vi-VN").format(n) + " ₫" : "Liên hệ";
  const fmt = (d) =>
    d
      ? new Date(d).toLocaleString("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";
  const toast = (m) => {
    const e = document.createElement("div");
    e.className = "toast";
    e.textContent = m;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 2600);
  };
  async function sha(v) {
    const b = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(v),
    );
    return [...new Uint8Array(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  }
  async function authenticateRemote(username, password) {
    try {
      const response = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.token) return { token: data.token };
      return { error: data.error || `Auth API trả về HTTP ${response.status}.` };
    } catch (error) { /* local development can use the fallback credentials */ }
    return { error: "Không thể kết nối tới Auth API." };
  }
  const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:";
  async function hydrateRemoteBookings() {
    const token = sessionStorage.getItem(TOKEN);
    if (!token) return false;
    try {
      const response = await fetch("/api/admin/bookings", { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401) {
        sessionStorage.removeItem(SESSION);
        sessionStorage.removeItem(TOKEN);
        remoteBookingError = "Phiên Admin đã hết hạn. Vui lòng đăng nhập lại.";
        return false;
      }
      if (!response.ok) {
        remoteBookingError = payload.error || `Không thể tải booking từ database (HTTP ${response.status}).`;
        return false;
      }
      const rows = Array.isArray(payload) ? payload : [];
      remoteBookingError = "";
      NhipBacStore.bookings.save(rows.map(x => ({ id: x.id, bookingCode: x.booking_code || "", customerName: x.customer_name, phone: x.phone, serviceId: x.service_id || "", serviceNameSnapshot: x.service_name_snapshot, preferredDate: x.preferred_date || "", preferredTime: x.preferred_time || "", message: x.message || "", createdAt: x.created_at, status: x.status, adminNote: x.admin_note || "", updatedAt: x.updated_at })));
      return true;
    } catch (error) { remoteBookingError = "Không thể kết nối tới API booking của Vercel."; return false; }
  }
  let bookingPollTimer = null;
  let bookingSnapshotReady = false;
  let knownBookingIds = new Set();
  function playNewBookingSound(force = false) {
    if (!force && sessionStorage.getItem("nhipbac.admin.sound.v1") !== "enabled") return;
    const audio = new Audio("assets/audio/new-booking.mp3");
    audio.volume = 0.65;
    audio.play().catch(() => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      oscillator.frequency.setValueAtTime(1174.66, context.currentTime + 0.14);
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.48);
    });
  }
  function notifyNewBookings(items) {
    if (!items.length) return;
    const first = items[0];
    toast(`Có ${items.length} lịch đặt mới · ${first.bookingCode || first.id}`);
    playNewBookingSound();
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("Nhíp Bạc có lịch đặt mới", { body: `${first.bookingCode || first.id} · ${first.customerName} · ${first.serviceNameSnapshot}`, icon: "assets/nhip-bac-images/logo.jpg", tag: "nhipbac-new-booking" });
      notification.onclick = () => { window.focus(); location.hash = "#bookings"; notification.close(); };
    }
  }
  function startBookingPolling() {
    if (bookingPollTimer) clearInterval(bookingPollTimer);
    knownBookingIds = new Set(NhipBacStore.bookings.all().map(item => item.id));
    bookingSnapshotReady = true;
    bookingPollTimer = setInterval(async () => {
      const loaded = await hydrateRemoteBookings();
      if (!loaded) return;
      const current = NhipBacStore.bookings.all();
      const fresh = current.filter(item => !knownBookingIds.has(item.id) && item.status === "new");
      knownBookingIds = new Set(current.map(item => item.id));
      if (bookingSnapshotReady && fresh.length) { notifyNewBookings(fresh); render(location.hash.slice(1) || "dashboard"); }
      bookingSnapshotReady = true;
    }, 15000);
  }
  function login() {
  app.innerHTML = `<main class="login-page"><section class="login-card"><div class="admin-brand"><img src="assets/nhip-bac-images/logo.jpg"><span>Nhíp Bạc<small>ADMIN CONSOLE</small></span></div><h1>Đăng nhập quản trị</h1><p class="notice">Tài khoản demo dành cho phát triển nội bộ. Dữ liệu và phiên đăng nhập chỉ tồn tại trên trình duyệt này.</p><form id="loginForm"><label>Tên đăng nhập<input name="username" autocomplete="username" required></label><label>Mật khẩu<div class="password-wrap"><input name="password" type="password" autocomplete="current-password" required><button type="button" id="togglePassword" aria-label="Hiện/Ẩn mật khẩu" class="password-toggle-btn"><svg id="eyeIcon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div></label><div class="login-error" id="loginError"></div><button class="admin-btn" type="submit">Đăng nhập</button></form></section></main>`;

  document.getElementById("togglePassword").onclick = function () {
    const i = document.querySelector("[name=password]");
    const isPassword = i.type === "password";
    i.type = isPassword ? "text" : "password";

    // Cập nhật Icon (Mắt mở / Mắt gạch chéo)
    const svg = document.getElementById("eyeIcon");
    if (isPassword) {
      // Icon Mắt gạch chéo (Đang hiện mật khẩu -> Bấm để ẩn)
      svg.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    } else {
      // Icon Mắt thường (Đang ẩn mật khẩu -> Bấm để hiện)
      svg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
  };

  document.getElementById("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      err = document.getElementById("loginError");
    err.textContent = "Đang kiểm tra…";
    const remoteResult = await authenticateRemote(f.get("username"), f.get("password"));
    const remoteToken = remoteResult.token;
    const localValid = f.get("username") === config.username && (await sha(f.get("password"))) === config.passwordHash;
    if (!isLocalPreview && !remoteToken) {
      err.textContent = remoteResult.error || "Không thể xác thực Admin production.";
      return;
    }
    if (remoteToken || localValid) {
      sessionStorage.setItem(SESSION, "active");
      if (remoteToken) sessionStorage.setItem(TOKEN, remoteToken);
      location.hash = "#dashboard";
      await hydrateRemoteBookings();
      startBookingPolling();
      render();
    } else err.textContent = "Tên đăng nhập hoặc mật khẩu không đúng.";
  };
}
  function layout() {
    app.innerHTML = `<div class="admin-shell"><aside class="admin-sidebar"><div class="admin-brand"><img src="assets/nhip-bac-images/logo.jpg"><span>Nhíp Bạc<small>ADMIN CONSOLE</small></span></div><nav class="admin-nav"><a href="#dashboard" data-view="dashboard">▦ <span>Tổng quan</span></a><a href="#services" data-view="services">◈ <span>Dịch vụ & giá</span></a><a href="#reviews" data-view="reviews">★ <span>Đánh giá</span></a><a href="#bookings" data-view="bookings">▣ <span>Lịch đặt hẹn</span></a></nav><button class="logout-btn" id="logout">↪ <span>Đăng xuất</span></button></aside><main class="admin-main"><header class="admin-topbar"><h1 id="pageTitle">Tổng quan</h1><div class="admin-header-actions"><button type="button" class="admin-alert-btn" id="enableNotifications">Bật thông báo</button><button type="button" class="admin-alert-btn" id="enableSound">Bật âm thanh</button><span class="admin-user">◉ Admin · phiên hiện tại</span></div></header><section class="admin-content" id="content"></section></main></div>`;
    document.getElementById("logout").onclick = () => {
      if (bookingPollTimer) { clearInterval(bookingPollTimer); bookingPollTimer = null; }
      sessionStorage.removeItem(SESSION);
      sessionStorage.removeItem(TOKEN);
      location.hash = "";
      login();
    };
    document
      .querySelectorAll("[data-view]")
      .forEach((a) => (a.onclick = () => render(a.dataset.view)));
    document.getElementById("enableNotifications").onclick = async () => {
      if (!("Notification" in window)) return toast("Trình duyệt không hỗ trợ thông báo.");
      const permission = await Notification.requestPermission();
      toast(permission === "granted" ? "Đã bật thông báo booking." : "Thông báo chưa được cấp quyền.");
      document.getElementById("enableNotifications").textContent = permission === "granted" ? "Đã bật thông báo" : "Bật thông báo";
    };
    document.getElementById("enableSound").onclick = () => {
      sessionStorage.setItem("nhipbac.admin.sound.v1", "enabled");
      document.getElementById("enableSound").textContent = "Đã bật âm thanh";
      playNewBookingSound(true);
      toast("Đã bật âm thanh nhắc booking.");
    };
  }
  function modal(title, body, submit) {
    const b = document.createElement("div");
    b.className = "modal-backdrop";
    b.innerHTML = `<section class="admin-modal"><h2>${title}</h2>${body}</section>`;
    document.body.appendChild(b);
    b.addEventListener("click", (e) => {
      if (e.target === b) b.remove();
    });
    return { el: b, close: () => b.remove(), submit };
  }
  function serviceForm(item) {
    const x = item || {
      id: "",
      nameVi: "",
      nameEn: "",
      descriptionVi: "",
      descriptionEn: "",
      category: "",
      image: "",
      price: 0,
      unit: "phút",
      priceNote: "",
      visible: true,
      sortOrder: 1,
    };
    return `<form class="admin-form" id="serviceForm"><label>ID duy nhất<input name="id" value="${esc(x.id)}" required ${item ? "readonly" : ""}><span class="form-error" data-error="id"></span></label><label>Tên tiếng Việt<input name="nameVi" value="${esc(x.nameVi)}" required><span class="form-error" data-error="nameVi"></span></label><label>Tên tiếng Anh<input name="nameEn" value="${esc(x.nameEn)}"></label><label>Danh mục<input name="category" value="${esc(x.category)}"></label><label class="full">Mô tả tiếng Việt<textarea name="descriptionVi" rows="3">${esc(x.descriptionVi)}</textarea></label><label class="full">Mô tả tiếng Anh<textarea name="descriptionEn" rows="3">${esc(x.descriptionEn)}</textarea></label><label>Đường dẫn hình ảnh<input name="image" value="${esc(x.image)}"></label><label>Giá (VND)<input name="price" type="number" min="0" value="${x.price}"><span class="form-error" data-error="price"></span></label><label>Đơn vị tính<input name="unit" value="${esc(x.unit)}" required></label><label>Thứ tự hiển thị<input name="sortOrder" type="number" value="${x.sortOrder}"></label><label class="full">Ghi chú giá<input name="priceNote" value="${esc(x.priceNote)}"></label><label><span>Trạng thái</span><select name="visible"><option value="true" ${x.visible ? "selected" : ""}>Đang hiển thị</option><option value="false" ${!x.visible ? "selected" : ""}>Đang ẩn</option></select></label><div class="modal-actions full"><button type="button" class="admin-btn secondary" data-cancel>Hủy</button><button class="admin-btn">Lưu dịch vụ</button></div></form>`;
  }
  function reviewsForm(item) {
    const x = item || {
      name: "",
      content: "",
      rating: 5,
      language: "vi",
      reviewDate: new Date().toISOString().slice(0, 10),
      status: "pending",
    };
    return `<form class="admin-form" id="reviewForm"><label>Tên người đánh giá<input name="name" value="${esc(x.name)}" required></label><label>Ngày đánh giá<input name="reviewDate" type="date" value="${x.reviewDate}"></label><label class="full">Nội dung<textarea name="content" rows="4" required>${esc(x.content)}</textarea></label><label>Điểm<select name="rating">${[1, 2, 3, 4, 5].map((n) => `<option ${x.rating == n ? "selected" : ""}>${n}</option>`).join("")}</select></label><label>Ngôn ngữ<select name="language"><option value="vi" ${x.language === "vi" ? "selected" : ""}>Tiếng Việt</option><option value="en" ${x.language === "en" ? "selected" : ""}>English</option></select></label><label>Trạng thái<select name="status">${[
      ["draft", "Bản nháp"],
      ["pending", "Chờ duyệt"],
      ["published", "Đã xuất bản"],
      ["hidden", "Đã ẩn"],
    ]
      .map(
        (s) =>
          `<option value="${s[0]}" ${x.status === s[0] ? "selected" : ""}>${s[1]}</option>`,
      )
      .join(
        "",
      )}</select></label><div class="modal-actions full"><button type="button" class="admin-btn secondary" data-cancel>Hủy</button><button class="admin-btn">Lưu đánh giá</button></div></form>`;
  }
  function openForm(kind, item) {
    const m = modal(
      item ? "Chỉnh sửa" : "Thêm mới",
      kind === "service" ? serviceForm(item) : reviewsForm(item),
    );
    m.el.querySelector("[data-cancel]").onclick = m.close;
    m.el.querySelector("form").onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target),
        data = Object.fromEntries(f);
      if (kind === "service") {
        if (!data.nameVi || Number(data.price) < 0) {
          toast("Vui lòng kiểm tra tên và giá");
          return;
        }
        data.price = Number(data.price);
        data.sortOrder = Number(data.sortOrder) || 1;
        data.visible = data.visible === "true";
        data.createdAt = item?.createdAt || new Date().toISOString();
        item
          ? NhipBacStore.services.update({ ...item, ...data })
          : NhipBacStore.services.add(data);
      } else {
        if (!data.name || !data.content) {
          toast("Vui lòng nhập tên và nội dung");
          return;
        }
        data.rating = Number(data.rating);
        data.createdAt = item?.createdAt || new Date().toISOString();
        item
          ? NhipBacStore.reviews.update({ ...item, ...data })
          : NhipBacStore.reviews.add({
              id: NhipBacStore.id("review"),
              ...data,
            });
      }
      m.close();
      toast("Đã lưu thành công");
      render();
    };
  }
  function serviceView() {
    const q =
        document.querySelector("#serviceSearch")?.value.toLowerCase() || "",
      filter = document.querySelector("#serviceFilter")?.value || "all";
    let a = NhipBacStore.services
      .all()
      .filter(
        (x) =>
          (x.nameVi.toLowerCase().includes(q) ||
            x.nameEn.toLowerCase().includes(q)) &&
          (filter === "all" || String(x.visible) === filter),
      )
      .sort((x, y) => (x.sortOrder || 0) - (y.sortOrder || 0));
    return `<div class="admin-toolbar"><div><h2>Dịch vụ & giá cả</h2><p>Quản lý nguồn dữ liệu dùng chung cho services.html và pricing.html.</p></div><button class="admin-btn" id="addService">+ Thêm dịch vụ</button></div><div class="panel"><div class="filters"><input id="serviceSearch" placeholder="Tìm theo tên…" value="${esc(q)}"><select id="serviceFilter"><option value="all">Tất cả trạng thái</option><option value="true" ${filter === "true" ? "selected" : ""}>Đang hiển thị</option><option value="false" ${filter === "false" ? "selected" : ""}>Đang ẩn</option></select></div><table class="data-table"><thead><tr><th>ID</th><th>Dịch vụ</th><th>Giá</th><th>Trạng thái</th><th>Cập nhật</th><th>Thao tác</th></tr></thead><tbody>${a.length ? a.map((x) => `<tr><td><code>${esc(x.id)}</code></td><td><strong>${esc(x.nameVi)}</strong><br><small>${esc(x.category)}</small></td><td>${money(x.price)} / ${esc(x.unit)}<br><small>${esc(x.priceNote)}</small></td><td><span class="status ${x.visible ? "published" : "hidden"}">${x.visible ? "Hiển thị" : "Đã ẩn"}</span></td><td>${fmt(x.updatedAt)}</td><td><div class="table-actions"><button class="icon-btn" data-edit="${esc(x.id)}">Sửa</button><button class="icon-btn" data-toggle="${esc(x.id)}">${x.visible ? "Ẩn" : "Hiện"}</button><button class="icon-btn" data-delete="${esc(x.id)}">Xóa</button></div></td></tr>`).join("") : "<tr><td colspan=6 class=empty>Chưa có dịch vụ nào.</td></tr>"}</tbody></table></div>`;
  }
  function reviewView() {
    const a = NhipBacStore.reviews.all();
    return `<div class="admin-toolbar"><div><h2>Đánh giá khách hàng</h2><p>Chỉ đánh giá “Đã xuất bản” được hiển thị công khai.</p></div><button class="admin-btn" id="addReview">+ Thêm đánh giá</button></div><div class="panel"><table class="data-table"><thead><tr><th>Người đánh giá</th><th>Nội dung</th><th>Điểm</th><th>Ngày</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${a.length ? a.map((x) => `<tr><td><strong>${esc(x.name)}</strong><br><small>${x.language.toUpperCase()}</small></td><td>${esc(x.content)}</td><td>${"★".repeat(x.rating)}</td><td>${esc(x.reviewDate)}</td><td><span class="status ${x.status}">${{ draft: "Bản nháp", pending: "Chờ duyệt", published: "Đã xuất bản", hidden: "Đã ẩn" }[x.status]}</span></td><td><div class="table-actions"><button class="icon-btn" data-edit-review="${x.id}">Sửa</button><button class="icon-btn" data-delete-review="${x.id}">Xóa</button></div></td></tr>`).join("") : "<tr><td colspan=6 class=empty>Chưa có đánh giá.</td></tr>"}</tbody></table></div>`;
  }
  function bookingView() {
    let a = NhipBacStore.bookings
      .all()
      .sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
    return `<div class="admin-toolbar"><div><h2>Lịch đặt hẹn</h2><p>${remoteBookingError ? `<strong style="color:#b23a2f">${esc(remoteBookingError)}</strong>` : "Dữ liệu booking được tải từ Supabase thông qua Vercel API."}</p></div><button class="admin-btn secondary" id="exportBookings">Xuất CSV</button></div><div class="panel"><table class="data-table"><thead><tr><th>Mã</th><th>Khách hàng</th><th>Dịch vụ</th><th>Ngày mong muốn</th><th>Ngày gửi</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>${
      a.length
        ? a
            .map(
              (x) =>
                `<tr><td><strong>${esc(x.bookingCode || x.id)}</strong></td><td><strong>${esc(x.customerName)}</strong><br>${esc(x.phone)}</td><td>${esc(x.serviceNameSnapshot)}</td><td>${esc(x.preferredDate || "—")} ${esc(x.preferredTime || "")}</td><td>${fmt(x.createdAt)}</td><td><select class="booking-status" data-booking-status="${x.id}">${[
                  ["new", "Mới"],
                  ["processing", "Đang xử lý"],
                  ["confirmed", "Đã xác nhận"],
                  ["completed", "Hoàn tất"],
                  ["cancelled", "Đã hủy"],
                ]
                  .map(
                    (s) =>
                      `<option value="${s[0]}" ${x.status === s[0] ? "selected" : ""}>${s[1]}</option>`,
                  )
                  .join(
                    "",
                  )}</select></td><td><button class="icon-btn" data-booking="${x.id}">Chi tiết</button><button class="icon-btn" data-delete-booking="${x.id}">Xóa</button></td></tr>`,
            )
            .join("")
        : "<tr><td colspan=7 class=empty>Chưa có yêu cầu đặt hẹn. Booking từ form liên hệ sẽ xuất hiện ở đây.</td></tr>"
    }</tbody></table></div>`;
  }
  function dashboard() {
    const s = NhipBacStore.services.all(),
      r = NhipBacStore.reviews.all(),
      b = NhipBacStore.bookings.all();
    return `<div class="admin-toolbar"><div><h2>Tổng quan</h2><p>Chào mừng trở lại. Đây là dữ liệu thực tế từ localStorage.</p></div><button class="admin-btn" id="quickService">+ Thêm dịch vụ</button></div><div class="stat-grid"><div class="stat-card"><small>Tổng dịch vụ</small><strong>${s.length}</strong></div><div class="stat-card"><small>Tổng yêu cầu</small><strong>${b.length}</strong></div><div class="stat-card"><small>Yêu cầu mới</small><strong>${b.filter((x) => x.status === "new").length}</strong></div><div class="stat-card"><small>Đã xác nhận</small><strong>${b.filter((x) => x.status === "confirmed").length}</strong></div><div class="stat-card"><small>Tổng đánh giá</small><strong>${r.length}</strong></div><div class="stat-card"><small>Chờ duyệt</small><strong>${r.filter((x) => x.status === "pending").length}</strong></div></div><div class="panel"><h3>Yêu cầu đặt hẹn gần nhất</h3>${bookingView().match(/<table[\s\S]*<\/table>/)?.[0] || "<div class=empty>Chưa có booking.</div>"}</div>`;
  }
  function bind(view) {
    document.querySelectorAll("[data-edit]").forEach(
      (b) =>
        (b.onclick = () =>
          openForm(
            "service",
            NhipBacStore.services.all().find((x) => x.id === b.dataset.edit),
          )),
    );
    document.querySelectorAll("[data-toggle]").forEach(
      (b) =>
        (b.onclick = () => {
          const x = NhipBacStore.services
            .all()
            .find((x) => x.id === b.dataset.toggle);
          NhipBacStore.services.update({ ...x, visible: !x.visible });
          render("services");
        }),
    );
    document.querySelectorAll("[data-delete]").forEach(
      (b) =>
        (b.onclick = () => {
          if (confirm("Xóa dịch vụ này?")) {
            NhipBacStore.services.remove(b.dataset.delete);
            render("services");
          }
        }),
    );
    document
      .querySelector("#addService")
      ?.addEventListener("click", () => openForm("service"));
    document
      .querySelector("#addReview")
      ?.addEventListener("click", () => openForm("review"));
    document.querySelectorAll("[data-edit-review]").forEach(
      (b) =>
        (b.onclick = () =>
          openForm(
            "review",
            NhipBacStore.reviews
              .all()
              .find((x) => x.id === b.dataset.editReview),
          )),
    );
    document.querySelectorAll("[data-delete-review]").forEach(
      (b) =>
        (b.onclick = () => {
          if (confirm("Xóa đánh giá này?")) {
            NhipBacStore.reviews.remove(b.dataset.deleteReview);
            render("reviews");
          }
        }),
    );
    document.querySelectorAll("[data-booking-status]").forEach(
      (b) =>
        (b.onchange = async () => {
          const x = NhipBacStore.bookings
            .all()
            .find((x) => x.id === b.dataset.bookingStatus);
          NhipBacStore.bookings.update({ ...x, status: b.value });
          if (!(await remoteBookingMutation("PATCH", { id: x.id, status: b.value }))) toast("Không thể đồng bộ trạng thái lên database.");
          toast("Đã cập nhật trạng thái");
        }),
    );
    document.querySelectorAll("[data-delete-booking]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (confirm("Xóa yêu cầu này?")) {
            const id = b.dataset.deleteBooking;
            if (!(await remoteBookingMutation("DELETE", { id }))) return toast("Không thể xóa booking trên database.");
            NhipBacStore.bookings.remove(id);
            render("bookings");
          }
        }),
    );
    document
      .querySelector("#exportBookings")
      ?.addEventListener("click", exportCsv);
    document
      .querySelector("#quickService")
      ?.addEventListener("click", () => openForm("service"));
    document.querySelector("#serviceSearch")?.addEventListener("input", () => {
      document.querySelector("#content").innerHTML = serviceView();
      bind("services");
    });
    document.querySelector("#serviceFilter")?.addEventListener("change", () => {
      document.querySelector("#content").innerHTML = serviceView();
      bind("services");
    });
  }
  function exportCsv() {
    const rows = NhipBacStore.bookings.all(),
      head = [
        "bookingCode",
        "id",
        "customerName",
        "phone",
        "serviceNameSnapshot",
        "preferredDate",
        "preferredTime",
        "createdAt",
        "status",
        "message",
      ];
    const csv = [
        head,
        ...rows.map((x) =>
            head.map((k) => String(x[k] ?? "").replace(/"/g, '""')),
        ),
      ]
        .map((r) => r.map((x) => `"${x}"`).join(","))
        .join("\n"),
      a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    a.download = "nhipbac-bookings.csv";
    a.click();
  }
  function bindBookingDetails() {
    document.querySelectorAll("[data-booking]").forEach(
      (b) =>
        (b.onclick = () => {
          const x = NhipBacStore.bookings
            .all()
            .find((v) => v.id === b.dataset.booking);
          if (!x) return;
          const m = modal(
            "Chi tiết yêu cầu",
            `<div class="notice"><strong>Mã: ${esc(x.bookingCode || x.id)}</strong><br>${esc(x.customerName)} · ${esc(x.phone)}<br>${esc(x.serviceNameSnapshot)}<br>Ngày mong muốn: ${esc(x.preferredDate || "—")} ${esc(x.preferredTime || "")}<br>Gửi lúc: ${fmt(x.createdAt)}<br><br>${esc(x.message || "Không có ghi chú khách hàng.")}</div><label class="admin-form">Ghi chú nội bộ<textarea id="adminNote" rows="4">${esc(x.adminNote || "")}</textarea></label><div class="modal-actions"><button class="admin-btn" id="saveBookingNote">Lưu ghi chú</button></div>`,
          );
          m.el.querySelector("#saveBookingNote").onclick = async () => {
            const adminNote = m.el.querySelector("#adminNote").value;
            if (!(await remoteBookingMutation("PATCH", { id: x.id, adminNote }))) return toast("Không thể lưu ghi chú lên database.");
            NhipBacStore.bookings.update({
              ...x,
              adminNote,
            });
            m.close();
            toast("Đã lưu ghi chú");
          };
        }),
    );
  }
  function bindRemoteBookingActions() {
    const token = sessionStorage.getItem(TOKEN);
    if (!token) return;
    document.querySelectorAll("[data-booking-status]").forEach(select => select.addEventListener("change", async () => {
      const response = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ id: select.dataset.bookingStatus, status: select.value }) });
      if (!response.ok) toast("Không thể đồng bộ trạng thái lên database.");
    }));
  }
  async function remoteBookingMutation(method, body) {
    const token = sessionStorage.getItem(TOKEN);
    if (!token) return true;
    const response = await fetch("/api/admin/bookings", { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    return response.ok;
  }
  function render(view) {
    if (!sessionStorage.getItem(SESSION)) return login();
    if (!isLocalPreview && !sessionStorage.getItem(TOKEN)) return login();
    layout();
    view = view || location.hash.slice(1) || "dashboard";
    if (!["dashboard", "services", "reviews", "bookings"].includes(view))
      view = "dashboard";
    document
      .querySelectorAll("[data-view]")
      .forEach((a) => a.classList.toggle("active", a.dataset.view === view));
    document.getElementById("pageTitle").textContent = {
      dashboard: "Tổng quan",
      services: "Dịch vụ & giá cả",
      reviews: "Đánh giá khách hàng",
      bookings: "Lịch đặt hẹn",
    }[view];
    document.getElementById("content").innerHTML = {
      dashboard,
      services: serviceView,
      reviews: reviewView,
      bookings: bookingView,
    }[view]();
    bind(view);
    bindBookingDetails();
  }
  window.addEventListener("hashchange", () => render());
  window.addEventListener("storage", () => {
    if (sessionStorage.getItem(SESSION)) render();
  });
  (async () => { await hydrateRemoteBookings(); startBookingPolling(); render(); })();
})();
