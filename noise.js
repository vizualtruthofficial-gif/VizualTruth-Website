(function () {
  const canvases = Array.from(document.querySelectorAll("[data-noise]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readNumber(canvas, name, fallback) {
    const value = Number(canvas.dataset[name]);
    return Number.isFinite(value) ? value : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  canvases.forEach((canvas) => {
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const patternSize = Math.max(1, Math.round(readNumber(canvas, "patternSize", 250)));
    const patternScaleX = Math.max(0.1, readNumber(canvas, "patternScaleX", 1));
    const patternScaleY = Math.max(0.1, readNumber(canvas, "patternScaleY", 1));
    const patternRefreshInterval = Math.max(1, Math.round(readNumber(canvas, "patternRefreshInterval", 2)));
    const patternAlpha = clamp(Math.round(readNumber(canvas, "patternAlpha", 15)), 0, 255);
    let frame = 0;
    let animationId = 0;

    function resize() {
      canvas.width = Math.max(1, Math.round(patternSize * patternScaleX));
      canvas.height = Math.max(1, Math.round(patternSize * patternScaleY));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      drawGrain();
    }

    function drawGrain() {
      const imageData = context.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      for (let index = 0; index < data.length; index += 4) {
        const value = Math.random() * 255;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = patternAlpha;
      }

      context.putImageData(imageData, 0, 0);
    }

    function loop() {
      if (frame % patternRefreshInterval === 0) {
        drawGrain();
      }

      frame += 1;
      animationId = window.requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);

    if (!prefersReducedMotion) {
      loop();
    }

    window.addEventListener("pagehide", () => {
      window.cancelAnimationFrame(animationId);
    }, { once: true });
  });
})();
