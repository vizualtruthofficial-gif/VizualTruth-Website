(function () {
  const zones = Array.from(document.querySelectorAll("[data-flashlight]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readNumber(element, name, fallback) {
    const value = Number(element.dataset[name]);
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  zones.forEach((zone) => {
    const radius = readNumber(zone, "flashlightRadius", 220);
    const cards = Array.from(zone.querySelectorAll(".fact"));
    let animationFrame = 0;

    zone.style.setProperty("--flashlight-radius", `${radius}px`);

    function updateCardGlow(clientX, clientY) {
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const relativeX = ((clientX - rect.left) / rect.width) * 100;
        const relativeY = ((clientY - rect.top) / rect.height) * 100;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(clientX - centerX, clientY - centerY);
        const intensity = clamp(1 - distance / (radius * 1.15), 0, 1);

        card.style.setProperty("--card-glow-x", `${relativeX}%`);
        card.style.setProperty("--card-glow-y", `${relativeY}%`);
        card.style.setProperty("--card-glow-intensity", intensity.toFixed(3));
      });
    }

    function setFlashlight(clientX, clientY) {
      const rect = zone.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      const y = clamp(clientY - rect.top, 0, rect.height);

      zone.style.setProperty("--flashlight-x", `${x}px`);
      zone.style.setProperty("--flashlight-y", `${y}px`);
      updateCardGlow(clientX, clientY);
    }

    function scheduleFlashlight(event) {
      const point = event.touches ? event.touches[0] : event;
      if (!point) return;

      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        setFlashlight(point.clientX, point.clientY);
      });
    }

    function focusFlashlight(event) {
      const target = event.target.closest("p, .fact") || zone;
      const rect = target.getBoundingClientRect();
      setFlashlight(rect.left + rect.width / 2, rect.top + rect.height / 2);
      zone.classList.add("is-flashlight-active");
    }

    function clearCardGlow() {
      cards.forEach((card) => {
        card.style.setProperty("--card-glow-intensity", "0");
      });
    }

    zone.addEventListener("pointerenter", (event) => {
      zone.classList.add("is-flashlight-active");
      scheduleFlashlight(event);
    });
    zone.addEventListener("pointermove", scheduleFlashlight);
    zone.addEventListener("pointerdown", scheduleFlashlight);
    zone.addEventListener("touchmove", scheduleFlashlight, { passive: true });
    zone.addEventListener("focusin", focusFlashlight);

    zone.addEventListener("pointerleave", () => {
      zone.classList.remove("is-flashlight-active");
      clearCardGlow();
    });

    zone.addEventListener("focusout", () => {
      if (!zone.contains(document.activeElement)) {
        zone.classList.remove("is-flashlight-active");
        clearCardGlow();
      }
    });

    if (prefersReducedMotion) {
      zone.classList.add("is-flashlight-active");
    }
  });
})();
