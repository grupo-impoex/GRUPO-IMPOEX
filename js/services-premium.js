/* =========================================================
   Servicios — apertura táctil para contenedores en móvil/tablet
   ========================================================= */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const cards = Array.from(document.querySelectorAll('.container-flow-item'));
    const isTouchLike = () => window.matchMedia('(hover: none), (pointer: coarse)').matches;

    cards.forEach((card) => {
      card.addEventListener('click', (event) => {
        if (!isTouchLike()) return;

        const clickedLink = event.target.closest('a');
        if (clickedLink && card.classList.contains('is-open')) return;

        event.preventDefault();
        cards.forEach((item) => {
          if (item !== card) item.classList.remove('is-open');
        });
        card.classList.toggle('is-open');
      });
    });
  });
})();
