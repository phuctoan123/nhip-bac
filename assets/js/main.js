const STORAGE_KEY = "nhip-bac-language";

const pageMap = {
  home: "index.html",
  services: "services.html",
  pricing: "pricing.html",
  about: "about.html",
  reviews: "reviews.html",
  contact: "contact.html",
};

let pageCleanups = [];

function registerPageCleanup(cleanup) {
  pageCleanups.push(cleanup);
}

function cleanupPublicPage() {
  pageCleanups.splice(0).forEach((cleanup) => {
    try {
      cleanup();
    } catch (error) {
      console.warn("Nhíp Bạc page cleanup failed", error);
    }
  });
}

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
  window.dispatchEvent(new CustomEvent("nhipbac:language-changed", { detail: { lang: activeLang } }));
}

function initLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY) || "vi";
  const handlers = [];
  document.querySelectorAll(".lang-btn").forEach((button) => {
    const handler = () => setLanguage(button.dataset.lang);
    button.addEventListener("click", handler);
    handlers.push([button, handler]);
  });
  registerPageCleanup(() => handlers.forEach(([button, handler]) => button.removeEventListener("click", handler)));
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

const DEFAULT_CONTACT_PHONES = [
  { id: "dung", label: "Ms. Dung", number: "0934013486" },
  { id: "chau", label: "Ms. Châu", number: "0356735783" },
];

function normalizeContactPhone(value) {
  const phone = String(value || "").trim().replace(/[^0-9+().\-\s]/g, "");
  return /^[0-9+().\-\s]{8,25}$/.test(phone) ? phone : "";
}

function normalizeContactPhones(value) {
  const source = Array.isArray(value) ? value : [];
  return DEFAULT_CONTACT_PHONES.map((fallback, index) => {
    const item = source.find((candidate) => candidate?.id === fallback.id) || source[index] || {};
    return {
      ...fallback,
      label: String(item.label || fallback.label).trim().slice(0, 60) || fallback.label,
      number: normalizeContactPhone(item.number) || fallback.number,
    };
  });
}

function applyContactPhones(value) {
  const phones = normalizeContactPhones(value);
  document.querySelectorAll("[data-contact-phone]").forEach((link) => {
    const contact = phones.find((item) => item.id === link.dataset.contactPhone) || phones[0];
    const dialable = contact.number.replace(/(?!^\+)\D/g, "");
    link.href = `tel:${dialable}`;
    link.setAttribute("aria-label", `Gọi ${contact.label} ${contact.number}`);
    const text = link.querySelector(".dock-phone-text");
    if (text) text.textContent = `${contact.label} : ${contact.number}`;
  });
}

async function initContactPhone() {
  applyContactPhones(DEFAULT_CONTACT_PHONES);
  try {
    const response = await fetch("/api/settings?key=contact_phones", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    applyContactPhones(data.value?.phones || data.phones);
  } catch {
    // Local static previews use the default number until the API is available.
  }
}

function initPhoneDock() {
  const listeners = [];
  document.querySelectorAll("[data-phone-dock]").forEach((group) => {
    const trigger = group.querySelector(".dock-phone");
    if (!trigger) return;
    const setOpen = (open) => {
      group.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    };
    const onClick = () => setOpen(!group.classList.contains("is-open"));
    const onFocusIn = () => trigger.setAttribute("aria-expanded", "true");
    const onFocusOut = (event) => {
      if (!group.contains(event.relatedTarget)) setOpen(false);
    };
    const onDocumentClick = (event) => {
      if (!group.contains(event.target)) setOpen(false);
    };
    const onDocumentKeydown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    trigger.addEventListener("click", onClick);
    group.addEventListener("focusin", onFocusIn);
    group.addEventListener("focusout", onFocusOut);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeydown);
    listeners.push(() => {
      trigger.removeEventListener("click", onClick);
      group.removeEventListener("focusin", onFocusIn);
      group.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeydown);
    });
  });
  registerPageCleanup(() => listeners.forEach((cleanup) => cleanup()));
}

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (!toggle || !nav) return;

  const onToggle = () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("nav-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };
  toggle.addEventListener("click", onToggle);
  registerPageCleanup(() => toggle.removeEventListener("click", onToggle));
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
  registerPageCleanup(() => observer.disconnect());
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
  const intervalId = setInterval(() => {
    goToSlide((currentIndex + 1) % slides.length);
  }, 6000);
  registerPageCleanup(() => clearInterval(intervalId));
}

const pageTemplateCache = new Map();
const pageTemplateRequests = new Map();
let mobileSwipeNavigationCleanup = null;
let navigationInFlight = false;

function currentPageFile() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function renderedPageFile() {
  const pageKey = document.body?.dataset.page;
  return pageMap[pageKey] || currentPageFile();
}

async function loadPageTemplate(pageFile) {
  if (pageTemplateCache.has(pageFile)) return pageTemplateCache.get(pageFile);
  if (pageTemplateRequests.has(pageFile)) return pageTemplateRequests.get(pageFile);

  const request = fetch(pageFile, { headers: { Accept: "text/html" } })
    .then((response) => {
      if (!response.ok) throw new Error(`Page request failed: ${response.status}`);
      return response.text();
    })
    .then((html) => {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const main = parsed.querySelector("main");
      if (!main) throw new Error("Target page has no main element");
      const template = {
        main,
        title: parsed.title,
        lang: parsed.documentElement.lang || "vi",
        page: parsed.body?.dataset.page || "",
        description: parsed.head.querySelector('meta[name="description"]')?.content || "",
        canonical: parsed.head.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      };
      pageTemplateCache.set(pageFile, template);
      return template;
    })
    .finally(() => pageTemplateRequests.delete(pageFile));

  pageTemplateRequests.set(pageFile, request);
  return request;
}

function prefetchPage(pageFile) {
  if (!pageFile || pageFile === renderedPageFile()) return;
  loadPageTemplate(pageFile).catch(() => {});
}

function syncPageHead(template) {
  document.title = template.title;
  document.documentElement.lang = template.lang;
  const description = document.head.querySelector('meta[name="description"]');
  if (description && template.description) description.content = template.description;
  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical && template.canonical) canonical.href = new URL(template.canonical, window.location.href).href;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function softNavigate(pageFile, direction, historyMode = "push") {
  if (navigationInFlight || (historyMode === "push" && pageFile === renderedPageFile())) return;
  navigationInFlight = true;

  try {
    const template = await loadPageTemplate(pageFile);
    const replacePage = () => {
      const currentMain = document.querySelector("main");
      if (!currentMain) throw new Error("Current page has no main element");
      currentMain.replaceWith(template.main.cloneNode(true));
      syncPageHead(template);
      if (template.page) document.body.dataset.page = template.page;
      document.body.classList.remove("nav-open");
      document.querySelectorAll(".poster-modal, .booking-success-overlay").forEach((node) => node.remove());
      if (historyMode === "push") history.pushState({ page: pageFile }, "", pageFile);
      if (historyMode === "replace") history.replaceState({ page: pageFile }, "", pageFile);
      window.scrollTo(0, 0);
      initPublicPage();
    };

    if (typeof document.startViewTransition === "function") {
      const transition = document.startViewTransition(replacePage);
      await transition.finished.catch(() => {});
    } else {
      const leavingClass = `swipe-page-leaving-${direction}`;
      document.body.classList.add(leavingClass);
      await wait(140);
      replacePage();
      document.body.classList.remove(leavingClass);
      const enteringClass = `swipe-page-entering-${direction}`;
      document.body.classList.add(enteringClass);
      window.requestAnimationFrame(() => window.setTimeout(() => document.body.classList.remove(enteringClass), 360));
    }
  } catch (error) {
    console.warn("Soft navigation failed; using full navigation", error);
    if (historyMode === "none" || historyMode === "replace") window.location.reload();
    else window.location.href = pageFile;
  } finally {
    navigationInFlight = false;
  }
}

function initMobileSwipeNavigation() {
  if (mobileSwipeNavigationCleanup) mobileSwipeNavigationCleanup();
  if (window.innerWidth > 768) return;

  const pages = Object.values(pageMap);
  let tracking = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let prefetchedDirection = "";

  const adjacentPage = (deltaX) => {
    const index = pages.indexOf(renderedPageFile());
    if (index < 0) return null;
    const targetIndex = deltaX < 0 ? index + 1 : index - 1;
    return targetIndex >= 0 && targetIndex < pages.length ? pages[targetIndex] : null;
  };

  const onTouchStart = (event) => {
    if (event.touches.length !== 1) {
      tracking = false;
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("a, button, input, textarea, select, [data-phone-dock], .social-floating-dock, .screen-magnifier")) {
      tracking = false;
      return;
    }
    tracking = true;
    prefetchedDirection = "";
    touchStartX = event.touches[0].screenX;
    touchStartY = event.touches[0].screenY;
  };

  const onTouchMove = (event) => {
    if (!tracking || event.touches.length !== 1) return;
    if (document.body.classList.contains("screen-magnifier-dragging")) {
      tracking = false;
      return;
    }
    const deltaX = event.touches[0].screenX - touchStartX;
    const deltaY = event.touches[0].screenY - touchStartY;
    if (Math.abs(deltaX) < 24 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    const direction = deltaX < 0 ? "next" : "prev";
    if (prefetchedDirection === direction) return;
    prefetchedDirection = direction;
    prefetchPage(adjacentPage(deltaX));
  };

  const onTouchEnd = (event) => {
    if (!tracking || !event.changedTouches.length) return;
    tracking = false;
    const deltaX = event.changedTouches[0].screenX - touchStartX;
    const deltaY = event.changedTouches[0].screenY - touchStartY;
    if (Math.abs(deltaX) < 90 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    const pageFile = adjacentPage(deltaX);
    if (pageFile) softNavigate(pageFile, deltaX < 0 ? "next" : "prev");
  };

  const onPopState = () => {
    const pageFile = currentPageFile();
    if (pageFile !== renderedPageFile()) softNavigate(pageFile, "prev", "none");
  };

  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("popstate", onPopState);

  const index = pages.indexOf(renderedPageFile());
  if (index > 0) prefetchPage(pages[index - 1]);
  if (index >= 0 && index < pages.length - 1) prefetchPage(pages[index + 1]);

  mobileSwipeNavigationCleanup = () => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("popstate", onPopState);
    mobileSwipeNavigationCleanup = null;
  };
  registerPageCleanup(() => mobileSwipeNavigationCleanup?.());
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

  const onMouseEnter = () => {
    lens.classList.add("active");
  };

  const onMouseLeave = () => {
    lens.classList.remove("active");
  };

  const onMouseMove = (e) => {
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
  };

  logoImg.addEventListener("mouseenter", onMouseEnter);
  logoImg.addEventListener("mouseleave", onMouseLeave);
  logoImg.addEventListener("mousemove", onMouseMove);
  registerPageCleanup(() => {
    logoImg.removeEventListener("mouseenter", onMouseEnter);
    logoImg.removeEventListener("mouseleave", onMouseLeave);
    logoImg.removeEventListener("mousemove", onMouseMove);
    lens.remove();
  });
}


function initSocialDockAnimation() {
  const socialDock = document.querySelector('.social-floating-dock');
  if (!socialDock) return;
  const timers = [];

  // Đợi một chút cho trang load xong
  timers.push(setTimeout(() => {
    if (socialDock.classList.contains('hidden')) return;
    socialDock.classList.add('show');

    // Hiển thị từng item
    const items = socialDock.querySelectorAll('.dock-item');
    items.forEach((item, index) => {
      timers.push(setTimeout(() => {
        item.classList.add('show');
      }, 200 + index * 150)); // stagger effect
    });
  }, 800)); // Delay tổng khi trang load
  registerPageCleanup(() => timers.forEach((timer) => clearTimeout(timer)));
}
function initSocialDockSwipeVertical() {
  const dock = document.getElementById('socialDock');
  if (!dock) return;

  // Không để trạng thái ẩn cũ làm mất dock hoặc chặn thao tác trên mobile.
  localStorage.removeItem("social-dock-hidden");
  dock.classList.remove('hidden');
  dock.classList.add('show');
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
  overlay.innerHTML = `<div class="booking-success-card" role="dialog" aria-modal="true" aria-labelledby="bookingSuccessTitle"><div class="success-spark success-spark-one"></div><div class="success-spark success-spark-two"></div><div class="success-check">✓</div><p class="eyebrow">Nhíp Bạc - Booking received</p><h2 id="bookingSuccessTitle">Đặt lịch thành công!</h2><p>Cảm ơn <strong>${String(record.customerName).replace(/[&<>"']/g, "")}</strong>. Yêu cầu của bạn đã được ghi nhận.</p><div class="success-summary"><span>Mã yêu cầu</span><strong>${record.bookingCode || record.id}</strong></div><button type="button" class="btn btn-primary" data-close-success>Đã hiểu</button></div>`;
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

function setBookingLoading(form, loading) {
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  if (loading) {
    button.dataset.originalLabel = button.innerHTML;
    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.innerHTML = '<span class="booking-spinner" aria-hidden="true"></span><span>Đang gửi…</span>';
  } else {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.removeAttribute("aria-busy");
    if (button.dataset.originalLabel) button.innerHTML = button.dataset.originalLabel;
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
  const select=document.getElementById("bookingService");
  if(select) {
    const renderServiceOptions = (lang = document.documentElement.lang || "vi") => {
      const activeLang = lang === "en" ? "en" : "vi";
      const currentValue = select.value;
      select.innerHTML = services.map(s=>`<option value="${esc(s.id)}">${esc(activeLang === "en" ? (s.nameEn || s.nameVi) : s.nameVi)}</option>`).join("");
      if (services.some(s => s.id === currentValue)) select.value = currentValue;
    };
    renderServiceOptions();
    const onLanguageChanged = (event) => renderServiceOptions(event.detail?.lang);
    window.addEventListener("nhipbac:language-changed", onLanguageChanged);
    registerPageCleanup(() => window.removeEventListener("nhipbac:language-changed", onLanguageChanged));
  }
  const form=document.getElementById("bookingForm");
  if(form) form.addEventListener("submit", async e=>{e.preventDefault();if(form.dataset.submitting==="true")return;const f=new FormData(form), name=String(f.get("name")||"").trim(),phone=String(f.get("phone")||"").trim(),sid=String(f.get("service")||""),service=services.find(s=>s.id===sid),message=document.getElementById("bookingMessage");if(!name||!phone){message.textContent="Vui lòng nhập họ tên và số điện thoại.";message.style.color="#b94a43";return}form.dataset.submitting="true";setBookingLoading(form,true);const record={customerName:name,phone,serviceId:sid,serviceNameSnapshot:service?.nameVi||"Dịch vụ không xác định",preferredDate:f.get("date")||"",preferredTime:f.get("time")||"",message:f.get("note")||""};const result=await saveBooking(record);message.textContent=result.ok?"Đã ghi nhận yêu cầu. Nhíp Bạc sẽ liên hệ để xác nhận lịch.":result.error;message.style.color=result.ok?"#287344":"#b94a43";if(result.ok){form.reset();showBookingSuccess({...record,id:result.data?.booking?.id||NhipBacStore.id("booking"),bookingCode:result.data?.booking?.bookingCode});}setBookingLoading(form,false);setTimeout(()=>form.dataset.submitting="false",700)});
}

function initPublicPage() {
  cleanupPublicPage();
  initLanguage();
  initActiveNav();
  initContactPhone();
  initNavigation();
  initCarousel();
  initMobileSwipeNavigation();
  initPosterLightbox();
  initMagnifier();
  initSocialDockAnimation();
  initSocialDockSwipeVertical();
  initPhoneDock();
  initBookingCalendar();
  initPublicData();
  initReveal();
}

document.addEventListener("DOMContentLoaded", initPublicPage, { once: true });
