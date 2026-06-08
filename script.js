const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("active");
    observer.unobserve(entry.target);
  });
}, {
  root: null,
  threshold: 0.14,
  rootMargin: "0px 0px -60px 0px"
});

reveals.forEach((element) => revealObserver.observe(element));

const canUseHoverEffects = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canUseHoverEffects && !prefersReducedMotion) {
  document.querySelectorAll(".card").forEach((card) => {
    let frameId = null;
    let nextTransform = "";

    function applyTransform() {
      card.style.transform = nextTransform;
      frameId = null;
    }

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = -((y - rect.height / 2) / 34);
      const rotateY = (x - rect.width / 2) / 34;

      nextTransform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0,-6px,0)`;

      if (!frameId) {
        frameId = requestAnimationFrame(applyTransform);
      }
    });

    card.addEventListener("mouseleave", () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = null;
      card.style.transform = "translate3d(0,0,0)";
    });
  });
}
