/* =========================================================
   Soluciones — apertura automática en móvil/tablet por viewport
   Agrega .is-open cuando el contenedor entra en pantalla.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.panel-soluciones-containers .home-cargo-service'));
  if (!cards.length) return;

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* En desktop usamos hover normal. En touch usamos apertura automática por cercanía al viewport. */
  if (supportsHover) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-open', entry.isIntersecting && entry.intersectionRatio >= 0.45);
    });
  }, {
    threshold: [0, 0.45, 0.75],
    rootMargin: '-12% 0px -12% 0px'
  });

  cards.forEach((card) => observer.observe(card));
});