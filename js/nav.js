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
document.addEventListener('DOMContentLoaded', () => {
  const desktopLinks = document.querySelectorAll('.site-nav a');
  const mobileLinks = document.querySelectorAll('#mobile-nav a');

  const allLinks = [...desktopLinks, ...mobileLinks];

  const getPageName = () => {
    const page = window.location.pathname.split('/').pop();
    return page || 'index.html';
  };

  const getLinkData = (link) => {
    const url = new URL(link.getAttribute('href'), window.location.href);
    const page = url.pathname.split('/').pop() || 'index.html';

    return {
      page,
      hash: url.hash
    };
  };

  const clearActiveLinks = () => {
    allLinks.forEach(link => {
      link.classList.remove('active');
    });
  };

  const setActiveNav = () => {
    const currentPage = getPageName();
    const currentHash = window.location.hash || '#inicio';

    clearActiveLinks();

    allLinks.forEach(link => {
      const data = getLinkData(link);

      const isHome = currentPage === 'index.html' || currentPage === '';
      const isServicios = currentPage === 'servicios.html';
      const isNosotros = currentPage === 'nosotros.html';

      if (isHome) {
        const linkIsHome = data.page === 'index.html' || data.page === '';
        const sameHash = data.hash === currentHash;

        if (linkIsHome && sameHash) {
          link.classList.add('active');
        }
      }

      if (isServicios && data.page === 'servicios.html') {
        link.classList.add('active');
      }

      if (isNosotros && data.page === 'nosotros.html') {
        link.classList.add('active');
      }
    });
  };

  setActiveNav();

  window.addEventListener('hashchange', setActiveNav);

  window.addEventListener('load', () => {
    setTimeout(setActiveNav, 250);
  });

  window.addEventListener('scroll', () => {
    requestAnimationFrame(setActiveNav);
  }, { passive: true });
});

