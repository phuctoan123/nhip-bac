(function (global, document) {
  "use strict";

  const DEFAULTS = {
    zoom: 2,
    size: 150,
    holdDuration: 400,
    enabled: true,
    moveTolerance: 10,
  };

  class ScreenMagnifier {
    constructor(options = {}) {
      this.options = { ...DEFAULTS, ...options };
      this.enabled = Boolean(this.options.enabled);
      this.pointerId = null;
      this.pointerDown = false;
      this.active = false;
      this.holdTimer = null;
      this.rafId = 0;
      this.pendingPoint = null;
      this.overlay = null;
      this.scene = null;
      this.lens = null;

      this.onPointerDown = this.onPointerDown.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerUp = this.onPointerUp.bind(this);
      this.onPointerCancel = this.onPointerCancel.bind(this);
      this.onVisibilityChange = this.onVisibilityChange.bind(this);
      this.onWindowBlur = this.onWindowBlur.bind(this);
      this.onViewportChange = this.onViewportChange.bind(this);

      if (this.enabled) this.enable();
    }

    enable() {
      if (this.enabled && this.listenersAttached) return this;
      this.enabled = true;
      if (this.listenersAttached) return this;
      document.addEventListener("pointerdown", this.onPointerDown, { capture: true, passive: true });
      document.addEventListener("pointermove", this.onPointerMove, { capture: true, passive: false });
      document.addEventListener("pointerup", this.onPointerUp, { capture: true, passive: true });
      document.addEventListener("pointercancel", this.onPointerCancel, { capture: true, passive: true });
      document.addEventListener("visibilitychange", this.onVisibilityChange);
      window.addEventListener("blur", this.onWindowBlur);
      window.addEventListener("scroll", this.onViewportChange, { passive: true });
      window.addEventListener("resize", this.onViewportChange, { passive: true });
      this.listenersAttached = true;
      return this;
    }

    disable() {
      this.enabled = false;
      this.cancelInteraction();
      if (!this.listenersAttached) return this;
      document.removeEventListener("pointerdown", this.onPointerDown, true);
      document.removeEventListener("pointermove", this.onPointerMove, true);
      document.removeEventListener("pointerup", this.onPointerUp, true);
      document.removeEventListener("pointercancel", this.onPointerCancel, true);
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
      window.removeEventListener("blur", this.onWindowBlur);
      window.removeEventListener("scroll", this.onViewportChange);
      window.removeEventListener("resize", this.onViewportChange);
      this.listenersAttached = false;
      return this;
    }

    destroy() {
      this.disable();
      if (this.overlay) this.overlay.remove();
      this.overlay = null;
      this.scene = null;
      this.lens = null;
      return this;
    }

    isTouchPointer(event) {
      return event.isPrimary !== false && (event.pointerType === "touch" || event.pointerType === "pen");
    }

    onPointerDown(event) {
      if (!this.enabled || !this.isTouchPointer(event) || this.pointerDown) return;
      this.pointerDown = true;
      this.pointerId = event.pointerId;
      this.startPoint = { x: event.clientX, y: event.clientY };
      this.holdTimer = window.setTimeout(() => {
        if (!this.pointerDown || this.pointerId !== event.pointerId) return;
        this.activate(this.startPoint.x, this.startPoint.y);
      }, Math.max(0, Number(this.options.holdDuration) || DEFAULTS.holdDuration));
    }

    onPointerMove(event) {
      if (!this.pointerDown || event.pointerId !== this.pointerId) return;
      if (!this.active) {
        const dx = event.clientX - this.startPoint.x;
        const dy = event.clientY - this.startPoint.y;
        if (Math.hypot(dx, dy) > this.options.moveTolerance) this.cancelInteraction();
        return;
      }
      // Sau khi kích hoạt, di chuyển ngón tay là kéo kính lúp thay vì cuộn trang.
      event.preventDefault();
      this.scheduleUpdate(event.clientX, event.clientY);
    }

    onPointerUp(event) {
      if (event.pointerId === this.pointerId) this.cancelInteraction();
    }

    onPointerCancel(event) {
      if (event.pointerId === this.pointerId) this.cancelInteraction();
    }

    onVisibilityChange() {
      if (document.hidden) this.cancelInteraction();
    }

    onWindowBlur() {
      this.cancelInteraction();
    }

    onViewportChange() {
      if (this.active && this.currentPoint) this.scheduleUpdate(this.currentPoint.x, this.currentPoint.y);
    }

    activate(x, y) {
      if (this.active) return;
      this.ensureOverlay();
      this.buildScene();
      this.active = true;
      document.body.classList.add("screen-magnifier-dragging");
      this.overlay.classList.add("is-visible");
      this.scheduleUpdate(x, y);
    }

    cancelInteraction() {
      if (this.holdTimer) window.clearTimeout(this.holdTimer);
      this.holdTimer = null;
      this.pointerDown = false;
      this.pointerId = null;
      this.active = false;
      document.body.classList.remove("screen-magnifier-dragging");
      if (this.overlay) this.overlay.classList.remove("is-visible");
    }

    ensureOverlay() {
      if (this.overlay) return;
      this.overlay = document.createElement("div");
      this.overlay.className = "screen-magnifier";
      this.overlay.setAttribute("aria-hidden", "true");

      this.scene = document.createElement("div");
      this.scene.className = "screen-magnifier__scene";

      this.lens = document.createElement("div");
      this.lens.className = "screen-magnifier__lens";
      this.lens.appendChild(this.scene);
      this.overlay.appendChild(this.lens);
      document.body.appendChild(this.overlay);
    }

    buildScene() {
      this.scene.replaceChildren();
      const bodyStyle = getComputedStyle(document.body);
      this.scene.style.background = bodyStyle.background;
      this.scene.style.color = bodyStyle.color;
      this.scene.style.font = bodyStyle.font;
      this.scene.style.width = `${Math.max(document.documentElement.scrollWidth, window.innerWidth)}px`;
      this.scene.style.minHeight = `${Math.max(document.documentElement.scrollHeight, window.innerHeight)}px`;

      Array.from(document.body.childNodes).forEach((node) => {
        if (node === this.overlay) return;
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("script, .screen-magnifier, .magnifier-lens")) return;
        this.scene.appendChild(node.cloneNode(true));
      });

      this.syncControls();
      this.syncImages();
    }

    syncControls() {
      const source = document.querySelectorAll("input, textarea, select");
      const clone = this.scene.querySelectorAll("input, textarea, select");
      source.forEach((control, index) => {
        const copy = clone[index];
        if (!copy) return;
        if (control instanceof HTMLInputElement) {
          copy.value = control.value;
          copy.checked = control.checked;
        } else if (control instanceof HTMLTextAreaElement) {
          copy.value = control.value;
        } else if (control instanceof HTMLSelectElement) {
          copy.value = control.value;
        }
      });
    }

    syncImages() {
      const source = document.images;
      const clone = this.scene.querySelectorAll("img");
      Array.from(source).forEach((image, index) => {
        const copy = clone[index];
        if (copy && image.currentSrc) copy.src = image.currentSrc;
      });
    }

    scheduleUpdate(x, y) {
      this.currentPoint = { x, y };
      this.pendingPoint = { x, y };
      if (this.rafId) return;
      this.rafId = window.requestAnimationFrame(() => {
        this.rafId = 0;
        if (!this.active || !this.pendingPoint) return;
        const point = this.pendingPoint;
        this.pendingPoint = null;
        this.updateLens(point.x, point.y);
      });
    }

    updateLens(x, y) {
      const size = Math.max(80, Number(this.options.size) || DEFAULTS.size);
      const zoom = Math.max(1, Number(this.options.zoom) || DEFAULTS.zoom);
      const left = Math.min(Math.max(8, x - size / 2), Math.max(8, window.innerWidth - size - 8));
      const top = Math.min(Math.max(8, y - size / 2), Math.max(8, window.innerHeight - size - 8));
      const sourceX = x + window.scrollX;
      const sourceY = y + window.scrollY;
      const translateX = x - left - sourceX * zoom;
      const translateY = y - top - sourceY * zoom;

      this.lens.style.width = `${size}px`;
      this.lens.style.height = `${size}px`;
      this.lens.style.left = `${left}px`;
      this.lens.style.top = `${top}px`;
      this.scene.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${zoom})`;
    }
  }

  global.ScreenMagnifier = ScreenMagnifier;

  const init = () => {
    if (global.nhipBacScreenMagnifier) return;
    global.nhipBacScreenMagnifier = new ScreenMagnifier({
      zoom: 2,
      size: 150,
      holdDuration: 400,
      enabled: true,
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})(window, document);
