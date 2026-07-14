document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('impoexIntro');
  const contactPanel = document.getElementById('contacto');

  /* =========================
     OCULTAR SOLO LA INTRO
     ========================= */
  if (intro) {
    const updateIntroVisibility = () => {
      const introLimit = intro.offsetHeight - window.innerHeight * 0.35;
      const shouldHideIntro = window.scrollY > Math.max(180, introLimit);

      document.body.classList.toggle('intro-finished', shouldHideIntro);
    };

    updateIntroVisibility();

    window.addEventListener('scroll', updateIntroVisibility, { passive: true });
    window.addEventListener('resize', updateIntroVisibility);
  }

  /* =========================
     CONTACTO: SUBIR/BAJAR ANTES DE CAMBIAR PANEL
     ========================= */
  if (contactPanel) {
    const canScrollInsideContact = (deltaY) => {
      const scrollTop = contactPanel.scrollTop;
      const maxScroll = contactPanel.scrollHeight - contactPanel.clientHeight;

      const scrollingDown = deltaY > 0;
      const scrollingUp = deltaY < 0;

      const canGoDown = scrollTop < maxScroll - 2;
      const canGoUp = scrollTop > 2;

      return (scrollingDown && canGoDown) || (scrollingUp && canGoUp);
    };

    window.addEventListener(
      'wheel',
      (event) => {
        const isInsideContact = event.target.closest('#contacto');
        if (!isInsideContact) return;

        if (canScrollInsideContact(event.deltaY)) {
          event.stopImmediatePropagation();
        }
      },
      { capture: true, passive: true }
    );
  }
});