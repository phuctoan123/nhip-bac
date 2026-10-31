const STORAGE_KEY = "nhip-bac-language";

const pageMap = {
  home: "index.html",
  services: "services.html",
  pricing: "pricing.html",
  about: "about.html",
  reviews: "reviews.html",
  contact: "contact.html",
};

function setLanguage(lang) {
  const activeLang = lang === "en" ? "en" : "vi";
  document.documentElement.lang = activeLang;
  localStorage.setItem(STORAGE_KEY, activeLang);

  // Update text content for all i18n elements
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = node.dataset[activeLang];
    if (value) node.textContent = value;
  });

  // Update image sources based on language
  document.querySelectorAll("img[data-src-vi][data-src-en]").forEach((img) => {
    const src = activeLang === "en" ? img.dataset.srcEn : img.dataset.srcVi;
    if (src) img.src = src;
  });

  // Update active button state
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.remove("is-active");
    if (button.dataset.lang === activeLang) {
      button.classList.add("is-active");
    }
  });
}

function initLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY) || "vi";
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
  setLanguage(saved);
}

function initActiveNav() {
  const nav = document.querySelector(".site-nav");
  const body = document.body;
  if (!nav || !body || !body.dataset.page) return;

  const currentPage = body.dataset.page;
  const currentFile = pageMap[currentPage];

  nav.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;

    const file = href.split("/").pop().split("?")[0].split("#")[0];
    if (file === currentFile) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  });

  items.forEach((item) => observer.observe(item));
}

function initCarousel() {
  const carousel = document.querySelector(".review-carousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".review-slide");
  const dotsContainer = carousel.querySelector(".carousel-dots");
  
  if (slides.length === 0 || !dotsContainer) return;

  let currentIndex = 0;

  // Generate carousel dots
  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.add("carousel-dot");
    if (index === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    slides[currentIndex].classList.remove("is-active");
    dotsContainer.children[currentIndex].classList.remove("is-active");
    currentIndex = index;
    slides[currentIndex].classList.add("is-active");
    dotsContainer.children[currentIndex].classList.add("is-active");
  }

  // Auto-rotate every 6 seconds
  setInterval(() => {
    goToSlide((currentIndex + 1) % slides.length);
  }, 6000);
}

function initMobileSwipeNavigation() {
  if (window.innerWidth > 768) return;

  const pages = Object.values(pageMap);
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentIndex = pages.indexOf(currentPath);

  let touchStartX = 0;
  let touchStartY = 0;

  document.body.style.transition = "transform .45s cubic-bezier(.22,1,.36,1), opacity .45s ease";

  window.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].screenX;
    const touchEndY = event.changedTouches[0].screenY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (Math.abs(deltaX) < 90) return;

    if (deltaX < 0 && currentIndex < pages.length - 1) {
      document.body.style.transform = "translateX(-100px)";
      document.body.style.opacity = ".15";

      setTimeout(() => {
        window.location.href = pages[currentIndex + 1];
      }, 320);
    }

    if (deltaX > 0 && currentIndex > 0) {
      document.body.style.transform = "translateX(100px)";
      document.body.style.opacity = ".15";

      setTimeout(() => {
        window.location.href = pages[currentIndex - 1];
      }, 320);
    }
  }, { passive: true });
}

function initFloatingSocialDock() {
  // Social dock is now HTML-based with CSS glassmorphism styling
  // No JavaScript initialization needed - hover animations handled by CSS
}

function initPosterLightbox() {
  const posterFrames = document.querySelectorAll(".poster-frame");
  
  posterFrames.forEach((frame) => {
    frame.addEventListener("click", () => {
      const img = frame.querySelector("img");
      if (!img) return;

      const modal = document.createElement("div");
      modal.className = "poster-modal active";
      
      const modalImg = document.createElement("img");
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      
      const closeBtn = document.createElement("button");
      closeBtn.className = "poster-modal-close";
      closeBtn.innerHTML = "×";
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "Close lightbox");
      
      modal.appendChild(modalImg);
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);
      
      const closeModal = () => {
        modal.classList.remove("active");
        setTimeout(() => modal.remove(), 300);
      };
      
      closeBtn.addEventListener("click", closeModal);
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
      
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
      }, { once: true });
    });
  });
}

function initMagnifier() {
  const logoImg = document.querySelector(".brand-logo");
  if (!logoImg) return;

  const lens = document.createElement("div");
  lens.className = "magnifier-lens";
  document.body.appendChild(lens);

  const lensSize = 120;
  const zoom = 2.6; // 6x magnification (264/44 = 6x for 44px logo)

  logoImg.addEventListener("mouseenter", () => {
    lens.classList.add("active");
  });

  logoImg.addEventListener("mouseleave", () => {
    lens.classList.remove("active");
  });

  logoImg.addEventListener("mousemove", (e) => {
    const rect = logoImg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if cursor is within logo bounds
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      lens.classList.remove("active");
      return;
    }

    lens.classList.add("active");

    // Position the lens centered on cursor
    const lensX = e.clientX - lensSize / 2;
    const lensY = e.clientY - lensSize / 2;

    lens.style.left = lensX + "px";
    lens.style.top = lensY + "px";

    // Calculate magnified background position
    const bgX = x * zoom;
    const bgY = y * zoom;

    lens.style.backgroundImage = `url('${logoImg.src}')`;
    lens.style.backgroundPosition = `${-bgX + lensSize / 2}px ${-bgY + lensSize / 2}px`;
  });
}


function initSocialDockAnimation() {
  const socialDock = document.querySelector('.social-floating-dock');
  if (!socialDock) return;

  // Đợi một chút cho trang load xong
  setTimeout(() => {
    socialDock.classList.add('show');

    // Hiển thị từng item
    const items = socialDock.querySelectorAll('.dock-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('show');
      }, 200 + index * 150); // stagger effect
    });
  }, 800); // Delay tổng khi trang load
}
function initSocialDockSwipeVertical() {
  const dock = document.getElementById('socialDock');
  if (!dock) return;

  const STORAGE_KEY = "social-dock-hidden";
  let isHidden = localStorage.getItem(STORAGE_KEY) === "true";

  let touchStartY = 0;
  let isDragging = false;

  function showDock() {
    dock.classList.remove('hidden');
    dock.classList.add('show');
    localStorage.setItem(STORAGE_KEY, "false");
  }

  function hideDock() {
    dock.classList.add('hidden');
    localStorage.setItem(STORAGE_KEY, "true");
  }

  // Touch events
  dock.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
    isDragging = true;
  }, { passive: false });

  dock.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentY = e.changedTouches[0].screenY;
    const deltaY = currentY - touchStartY;

    // Nếu quẹt xuống khá mạnh → ngăn scroll trang
    if (deltaY > 30) {
      e.preventDefault();   // Ngăn scroll trang
    }
  }, { passive: false });

  dock.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const touchEndY = e.changedTouches[0].screenY;
    const deltaY = touchEndY - touchStartY;

    // Quẹt xuống (ẩn) - ngưỡng cao hơn để tránh nhầm scroll
    if (deltaY > 100) {
      hideDock();
    }
    // Quẹt lên (hiện)
    else if (deltaY < -90 && dock.classList.contains('hidden')) {
      showDock();
    }
  }, { passive: false });

  // Khởi tạo
  if (isHidden) {
    dock.classList.add('hidden');
  } else {
    setTimeout(() => {
      dock.classList.add('show');
    }, 700);
  }
}

function initBookingCalendar() {
  const root = document.getElementById("bookingCalendar");
  const input = document.getElementById("bookingDate");
  const trigger = document.getElementById("calendarTrigger");
  if (!root || !input || !trigger) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected = input.value ? new Date(`${input.value}T00:00:00`) : null;
  const months = ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"];
  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const sameDay = (a, b) => a && b && iso(a) === iso(b);

  function render() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const dayNumber = i - offset + 1;
      const date = new Date(year, month, dayNumber);
      const outside = date.getMonth() !== month;
      const disabled = date < today;
      cells.push(`<button type="button" class="calendar-day${outside ? " is-outside" : ""}${sameDay(date, today) ? " is-today" : ""}${sameDay(date, selected) ? " is-selected" : ""}" data-date="${iso(date)}" aria-label="${date.toLocaleDateString("vi-VN", { dateStyle: "full" })}"${disabled ? " disabled" : ""}>${date.getDate()}</button>`);
    }
    trigger.textContent = selected ? `Ngày đã chọn: ${selected.toLocaleDateString("vi-VN", { dateStyle: "full" })}` : "Chọn ngày đến";
    root.innerHTML = `<div class="calendar-header"><strong class="calendar-month">${months[month]} ${year}</strong><div class="calendar-nav"><button type="button" data-calendar-prev aria-label="Tháng trước">‹</button><button type="button" data-calendar-next aria-label="Tháng sau">›</button></div></div><div class="calendar-weekdays">${weekdays.map(day => `<span>${day}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div><p class="calendar-hint">${selected ? `Đã chọn: ${selected.toLocaleDateString("vi-VN", { dateStyle: "full" })}` : "Chọn ngày bạn muốn đến Nhíp Bạc"}</p>`;
    root.querySelector("[data-calendar-prev]").addEventListener("click", () => { viewDate = new Date(year, month - 1, 1); render(); });
    root.querySelector("[data-calendar-next]").addEventListener("click", () => { viewDate = new Date(year, month + 1, 1); render(); });
    root.querySelectorAll("[data-date]:not(:disabled)").forEach(button => button.addEventListener("click", () => { selected = new Date(`${button.dataset.date}T00:00:00`); input.value = button.dataset.date; input.dispatchEvent(new Event("change", { bubbles: true })); root.classList.remove("is-open"); trigger.setAttribute("aria-expanded", "false"); render(); }));
  }
  trigger.addEventListener("click", () => { const isOpen = root.classList.toggle("is-open"); trigger.setAttribute("aria-expanded", String(isOpen)); });
  document.getElementById("bookingForm")?.addEventListener("reset", () => {
    selected = null;
    viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    root.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    setTimeout(render, 0);
  });
  render();
}

function playBookingSuccessSound() {
  const audio = new Audio("assets/audio/booking-success.mp3");
  audio.volume = 0.55;
  audio.play().catch(() => {
    // Graceful fallback while the optional MP3 has not been added yet.
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + index * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.12 + 0.42);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(context.currentTime + index * 0.12);
      oscillator.stop(context.currentTime + index * 0.12 + 0.45);
    });
  });
}

function showBookingSuccess(record) {
  document.querySelector(".booking-success-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "booking-success-overlay";
  overlay.innerHTML = `<div class="booking-success-card" role="dialog" aria-modal="true" aria-labelledby="bookingSuccessTitle"><div class="success-spark success-spark-one"></div><div class="success-spark success-spark-two"></div><div class="success-check">✓</div><p class="eyebrow">Nhíp Bạc · Booking received</p><h2 id="bookingSuccessTitle">Đặt lịch thành công!</h2><p>Cảm ơn <strong>${String(record.customerName).replace(/[&<>"']/g, "")}</strong>. Yêu cầu của bạn đã được ghi nhận.</p><div class="success-summary"><span>Mã yêu cầu</span><strong>${record.bookingCode || record.id}</strong></div><button type="button" class="btn btn-primary" data-close-success>Đã hiểu</button></div>`;
  document.body.appendChild(overlay);
  playBookingSuccessSound();
  overlay.querySelector("[data-close-success]").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", event => { if (event.target === overlay) overlay.remove(); });
  setTimeout(() => overlay.remove(), 12000);
}

async function saveBooking(record) {
  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return { ok: true, data };
    return { ok: false, error: data.error || "Không thể lưu yêu cầu đặt lịch." };
  } catch (error) {
    const localPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:";
    if (localPreview) return { ok: NhipBacStore.bookings.add(record), local: true };
    return { ok: false, error: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." };
  }
}

function initPublicData() {
  if (!window.NhipBacStore) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const money = (n) => n ? `${new Intl.NumberFormat("vi-VN").format(n)} VND` : "Liên hệ";
  const services = NhipBacStore.services.all().filter(s => s.visible).sort((a,b) => a.sortOrder-b.sortOrder);
  const serviceRoot = document.getElementById("publicServices");
  if (serviceRoot) serviceRoot.innerHTML = services.map((s,i) => `<article class="detail-panel reveal"><figure class="detail-image"><img src="${esc(s.image)}" loading="lazy" alt="${esc(s.nameVi)}"></figure><span class="card-icon">${String(i+1).padStart(2,"0")}</span><h2 data-i18n data-vi="${esc(s.nameVi)}" data-en="${esc(s.nameEn || s.nameVi)}">${esc(s.nameVi)}</h2><p data-i18n data-vi="${esc(s.descriptionVi)}" data-en="${esc(s.descriptionEn || s.descriptionVi)}">${esc(s.descriptionVi)}</p><p><strong>${money(s.price)} / ${esc(s.unit)}</strong><br>${esc(s.priceNote)}</p><a class="btn btn-primary" href="contact.html">Đặt lịch</a></article>`).join("");
  const pricingRoot = document.getElementById("publicPricing");
  if (pricingRoot) pricingRoot.innerHTML = `<div class="pricing-card featured tilt-card"><p class="eyebrow">Dịch vụ chính</p><h2>${esc(services[0]?.nameVi || "Chưa có dịch vụ")}</h2><div class="price">${services[0] ? money(services[0].price) : "—"} <span>/ ${esc(services[0]?.unit || "")}</span></div><p>${esc(services[0]?.priceNote || "Vui lòng liên hệ để được tư vấn.")}</p><a class="btn btn-primary" href="contact.html">Đặt lịch</a></div><div class="price-table"><div class="table-row head"><span>Dịch vụ</span><span>Giá</span></div>${services.map(s=>`<div class="table-row"><span>${esc(s.nameVi)}</span><strong>${money(s.price)} / ${esc(s.unit)}</strong></div>`).join("")}</div>`;
  const reviewRoot = document.getElementById("publicReviews");
  if (reviewRoot) { const reviews=NhipBacStore.reviews.all().filter(r=>r.status==="published"); reviewRoot.innerHTML=reviews.map(r=>`<article class="review-card reveal"><span>${"★".repeat(r.rating)}</span><p>${esc(r.content)}</p><cite>${esc(r.name)}</cite></article>`).join("") || `<p class="empty-state">Chưa có đánh giá được xuất bản.</p>`; }
  const select=document.getElementById("bookingService"); if(select) select.innerHTML=services.map(s=>`<option value="${esc(s.id)}">${esc(s.nameVi)}</option>`).join("");
  const form=document.getElementById("bookingForm");
  if(form) form.addEventListener("submit", async e=>{e.preventDefault();if(form.dataset.submitting==="true")return;const f=new FormData(form), name=String(f.get("name")||"").trim(),phone=String(f.get("phone")||"").trim(),sid=String(f.get("service")||""),service=services.find(s=>s.id===sid),message=document.getElementById("bookingMessage");if(!name||!phone){message.textContent="Vui lòng nhập họ tên và số điện thoại.";message.style.color="#b94a43";return}form.dataset.submitting="true";const record={customerName:name,phone,serviceId:sid,serviceNameSnapshot:service?.nameVi||"Dịch vụ không xác định",preferredDate:f.get("date")||"",preferredTime:f.get("time")||"",message:f.get("note")||""};const result=await saveBooking(record);message.textContent=result.ok?"Đã ghi nhận yêu cầu. Nhíp Bạc sẽ liên hệ để xác nhận lịch.":result.error;message.style.color=result.ok?"#287344":"#b94a43";if(result.ok){form.reset();showBookingSuccess({...record,id:result.data?.booking?.id||NhipBacStore.id("booking"),bookingCode:result.data?.booking?.bookingCode});}setTimeout(()=>form.dataset.submitting="false",700)});
}

document.addEventListener("DOMContentLoaded", () => {

  initLanguage();
  initActiveNav();
  initNavigation();
  initReveal();
  initCarousel();
  initMobileSwipeNavigation();
  initPosterLightbox();
  initMagnifier();
  initSocialDockAnimation();
  initSocialDockSwipeVertical();
  initBookingCalendar();
  initPublicData();
});
