(function () {
  const galleries = Array.from(document.querySelectorAll("[data-bounce-cards]"));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gsap = window.gsap;

  function getBaseTransform(card) {
    const base = window.getComputedStyle(card).getPropertyValue("--card-transform").trim();
    return base || "none";
  }

  function getNoRotationTransform(transformValue) {
    if (/rotate\([\s\S]*?\)/.test(transformValue)) {
      return transformValue.replace(/rotate\([\s\S]*?\)/, "rotate(0deg)");
    }

    return transformValue === "none" ? "rotate(0deg)" : `${transformValue} rotate(0deg)`;
  }

  function getPushedTransform(transformValue, offsetX) {
    const translateRegex = /translate\(\s*([-0-9.]+)px(?:\s*,\s*([-0-9.]+)px)?\s*\)/;
    const match = transformValue.match(translateRegex);

    if (match) {
      const currentX = parseFloat(match[1]);
      const currentY = match[2] ? `, ${match[2]}px` : "";
      return transformValue.replace(translateRegex, `translate(${currentX + offsetX}px${currentY})`);
    }

    return transformValue === "none" ? `translate(${offsetX}px)` : `${transformValue} translate(${offsetX}px)`;
  }

  function animateCard(card, transformValue, options) {
    if (gsap && !prefersReducedMotion) {
      gsap.killTweensOf(card);
      gsap.to(card, {
        transform: transformValue,
        duration: options.duration,
        delay: options.delay || 0,
        ease: options.ease,
        overwrite: "auto"
      });
      return;
    }

    card.style.transform = transformValue;
  }

  galleries.forEach((gallery) => {
    const cards = Array.from(gallery.querySelectorAll(".bounce-card"));

    function pushCards(index) {
      const pushDistance = Math.min(150, Math.max(72, gallery.clientWidth * 0.15));

      cards.forEach((target, targetIndex) => {
        const baseTransform = getBaseTransform(target);
        const isHovered = targetIndex === index;
        const distance = Math.abs(index - targetIndex);
        const nextTransform = isHovered
          ? `${getNoRotationTransform(baseTransform)} scale(1.06)`
          : `${getPushedTransform(baseTransform, targetIndex < index ? -pushDistance : pushDistance)} scale(0.98)`;

        target.style.zIndex = isHovered ? "30" : String(10 + targetIndex);
        animateCard(target, nextTransform, {
          duration: 0.4,
          delay: isHovered ? 0 : distance * 0.04,
          ease: "back.out(1.4)"
        });
      });
    }

    function resetCards() {
      cards.forEach((target, targetIndex) => {
        target.style.zIndex = String(10 + targetIndex);
        animateCard(target, getBaseTransform(target), {
          duration: 0.4,
          ease: "back.out(1.4)"
        });
      });
    }

    if (gsap && !prefersReducedMotion) {
      gsap.fromTo(
        cards,
        { scale: 0 },
        {
          scale: 1,
          stagger: 0.08,
          ease: "elastic.out(1, 0.5)",
          delay: 0.45
        }
      );
    }

    cards.forEach((card, index) => {
      card.addEventListener("mouseenter", () => pushCards(index));
      card.addEventListener("focus", () => pushCards(index));
      card.addEventListener("mouseleave", resetCards);
      card.addEventListener("blur", resetCards);
    });
  });

  function syncViewerState() {
    const targetId = window.location.hash.slice(1);
    const target = targetId ? document.getElementById(targetId) : null;
    document.body.classList.toggle("has-gallery-viewer", Boolean(target && target.classList.contains("gallery-viewer")));
  }

  window.addEventListener("hashchange", syncViewerState);
  syncViewerState();
})();
