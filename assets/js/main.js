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

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = node.dataset[activeLang];
    if (value) node.textContent = value;
  });

  document.querySelectorAll("[data-placeholder-vi], [data-placeholder-en]").forEach((node) => {
    const value = node.dataset[`placeholder${activeLang === "vi" ? "Vi" : "En"}`];
    if (value) node.setAttribute("placeholder", value);
  });

  document.querySelectorAll("img[data-src-vi][data-src-en]").forEach((image) => {
    const value = image.dataset[`src${activeLang === "vi" ? "Vi" : "En"}`];
    if (value && image.getAttribute("src") !== value) image.setAttribute("src", value);
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === activeLang);
  });
}

function initLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY) || "vi";
  document.querySelectorAll(".lang-btn").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
  setLanguage(saved);
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

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  const page = document.body.dataset.page;
  const currentHref = pageMap[page];
  if (currentHref) {
    document.querySelectorAll(`.site-nav a[href="${currentHref}"]`).forEach((link) => {
      link.classList.add("is-active");
    });
  }
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  items.forEach((item) => observer.observe(item));
}

function initTiltCards() {
  const cards = document.querySelectorAll(".tilt-card");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function initCarousel() {
  const slides = [...document.querySelectorAll(".review-slide")];
  const dotsWrap = document.querySelector(".carousel-dots");
  if (!slides.length || !dotsWrap) return;

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.className = index === 0 ? "is-active" : "";
    dotsWrap.append(dot);
  });

  const dots = [...dotsWrap.children];
  let active = 0;

  window.setInterval(() => {
    slides[active].classList.remove("is-active");
    dots[active].classList.remove("is-active");
    active = (active + 1) % slides.length;
    slides[active].classList.add("is-active");
    dots[active].classList.add("is-active");
  }, 4200);
}

function initBookingForm() {
  const form = document.querySelector("#bookingForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const message = [
      "Xin chào Nhíp Bạc, tôi muốn đặt lịch:",
      `Họ tên: ${data.get("name") || ""}`,
      `SĐT: ${data.get("phone") || ""}`,
      `Dịch vụ: ${data.get("service") || ""}`,
      `Thời gian: ${data.get("time") || ""}`,
      `Ghi chú: ${data.get("note") || ""}`,
    ].join("\n");

    window.open(`https://zalo.me/0934013486?message=${encodeURIComponent(message)}`, "_blank", "noopener");
  });
}

function initHeroCanvas() {
  const canvas = document.querySelector("#hairCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let hairs = [];
  let frame = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    hairs = Array.from({ length: Math.max(34, Math.floor(width / 26)) }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 80 + Math.random() * 160,
      speed: 0.25 + Math.random() * 0.65,
      sway: 14 + Math.random() * 38,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.14 + Math.random() * 0.34,
      hue: index % 4 === 0 ? "220,234,242" : "232,185,35",
    }));
  }

  function drawHair(hair, time) {
    const sway = Math.sin(time * 0.001 + hair.phase) * hair.sway;
    const gradient = context.createLinearGradient(hair.x, hair.y, hair.x + sway, hair.y + hair.length);
    gradient.addColorStop(0, `rgba(${hair.hue},0)`);
    gradient.addColorStop(0.45, `rgba(${hair.hue},${hair.opacity})`);
    gradient.addColorStop(1, `rgba(${hair.hue},0)`);

    context.beginPath();
    context.moveTo(hair.x, hair.y);
    context.bezierCurveTo(
      hair.x + sway,
      hair.y + hair.length * 0.24,
      hair.x - sway * 0.75,
      hair.y + hair.length * 0.64,
      hair.x + sway * 0.45,
      hair.y + hair.length
    );
    context.strokeStyle = gradient;
    context.lineWidth = 1.1;
    context.stroke();
  }

  function animate(time = 0) {
    context.clearRect(0, 0, width, height);
    hairs.forEach((hair) => {
      hair.y += hair.speed;
      if (hair.y > height + hair.length) {
        hair.y = -hair.length;
        hair.x = Math.random() * width;
      }
      drawHair(hair, time);
    });

    frame = window.requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  if (!prefersReducedMotion) {
    animate();
  } else {
    hairs.forEach((hair) => drawHair(hair, 0));
  }

  window.addEventListener("beforeunload", () => cancelAnimationFrame(frame));
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initNavigation();
  initReveal();
  initTiltCards();
  initCarousel();
  initBookingForm();
  initHeroCanvas();
});
