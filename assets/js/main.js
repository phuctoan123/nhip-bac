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

function initFloatingSocialMenu() {
  const oldButton = document.querySelector(".floating-zalo");
  if (oldButton) {
    oldButton.remove();
  }

  const style = document.createElement("style");

  style.textContent = `
    .social-fab {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .social-links {
      display: flex;
      flex-direction: column;
      gap: 12px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(.9);
      transition: all .45s cubic-bezier(.22,1,.36,1);
    }

    .social-fab.is-open .social-links {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .social-link,
    .social-trigger {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      backdrop-filter: blur(14px);
      background: rgba(25,25,25,.82);
      border: 1px solid rgba(255,255,255,.08);
      box-shadow: 0 18px 40px rgba(0,0,0,.28);
      color: white;
      transition: all .35s cubic-bezier(.22,1,.36,1);
    }

    .social-link:hover,
    .social-trigger:hover {
      transform: translateY(-6px) scale(1.06);
      background: rgba(212,175,55,.18);
      box-shadow: 0 22px 48px rgba(0,0,0,.38);
    }

    .social-link img {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .social-trigger {
      font-size: 1.4rem;
      cursor: pointer;
    }

    .social-fab.is-open .social-trigger {
      transform: rotate(45deg);
      background: rgba(212,175,55,.22);
    }
  `;

  document.head.append(style);

  const menu = document.createElement("div");
  menu.className = "social-fab";

  menu.innerHTML = `
    <div class="social-links">

        <a
          class="social-link social-zalo"
          href="https://zalo.me/0934013486"
          target="_blank"
          rel="noopener"
          aria-label="Zalo"
        > 
          <i class="fa-brands fa-zalo"></i>
          <span>Zalo</span>
        </a>

        <a
          class="social-link social-facebook"
          href="https://facebook.com/nhipbac"
          target="_blank"
          rel="noopener"
          aria-label="Facebook"
        >
          <i class="fa-brands fa-facebook-f" style="color: rgb(79, 164, 231);"></i>
        </a>

        <a
          class="social-link social-instagram"
          href="https://instagram.com/nhipbac"
          target="_blank"
          rel="noopener"
          aria-label="Instagram"
        >
          <style>
            .insta-gradient {
              background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #8a3ab9 90%);
              -webkit-background-clip: text;
              background-clip: text;
              color: transparent; /* Quan trọng để lộ nền gradient */
            }
          </style>

          <i class="fa-brands fa-square-instagram fa-fade insta-gradient"></i>
        </a>

        <a
          class="social-link social-tiktok"
          href="https://tiktok.com/@nhipbac"
          target="_blank"
          rel="noopener"
          aria-label="TikTok"
        >
          <i class="fa-brands fa-tiktok"></i>
        </a>

      </div>

    <button class="social-trigger">+</button>
  `;

  document.body.append(menu);

  const trigger = menu.querySelector(".social-trigger");

  trigger.addEventListener("click", () => {
    menu.classList.toggle("is-open");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initNavigation();
  initReveal();
  initCarousel();
  initMobileSwipeNavigation();
  initFloatingSocialMenu();
});