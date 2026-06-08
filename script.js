const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("active");
    observer.unobserve(entry.target);
  });
}, {
  threshold: 0.08,
  rootMargin: "0px 0px -24px 0px"
});

reveals.forEach((element) => revealObserver.observe(element));

// Mantido propositalmente sem tilt 3D/mousemove.
// Esse efeito é bonito, mas em alguns PCs deixa o scroll menos liso porque cria
// camadas e repaints constantes nos cards.
