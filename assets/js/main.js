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

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initNavigation();
  initReveal();
  initCarousel();
  initMobileSwipeNavigation();
  initPosterLightbox();
  initMagnifier();
});