/* =========================================================
   NAV — menú móvil + estado activo
   ========================================================= */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const header = document.getElementById('site-header');
    const links = Array.from(document.querySelectorAll('.site-nav a'));

    if (toggle && mobileNav) {
      toggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        toggle.classList.toggle('is-active', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        mobileNav.setAttribute('aria-hidden', String(!isOpen));
        document.body.classList.toggle('is-nav-open', isOpen);
      });

      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('is-open');
          toggle.classList.remove('is-active');
          toggle.setAttribute('aria-expanded', 'false');
          mobileNav.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('is-nav-open');
        });
      });
    }

    const updateHeader = () => {
      if (!header) return;
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    document.addEventListener('impoex:panelchange', (event) => {
      const id = event.detail && event.detail.id;
      if (!id) return;
      links.forEach(link => {
        const clean = link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', clean === id);
      });
    });

    if (!document.getElementById('intro') && header) header.classList.add('is-visible');
  });
})();
