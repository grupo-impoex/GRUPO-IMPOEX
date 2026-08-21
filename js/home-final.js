/* =========================================================
   IMPOEX HOME FINAL — Parallax, reveal, links seguros e intro cleanup
   ========================================================= */
(function () {
  function initStatsParallax() {
    const sections = document.querySelectorAll('.operations-counter-section');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!sections.length || prefersReducedMotion) return;

    let ticking = false;

    function updateParallax() {
      const windowHeight = window.innerHeight;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > windowHeight) return;

        const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const movement = (progress - 0.5) * 90;
        section.style.setProperty('--stats-parallax-y', `${movement}px`);
      });

      ticking = false;
    }

    function requestTick() {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick);
    updateParallax();
  }

  function initReveal() {
    const revealItems = document.querySelectorAll('.reveal-up');
    if (!revealItems.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    revealItems.forEach(item => observer.observe(item));
  }

  function initSafeHashLinks() {
    document.querySelectorAll('a[href="#"]').forEach(link => {
      link.addEventListener('click', event => event.preventDefault());
    });
  }

  function initIntroCleanup() {
    const intro = document.getElementById('impoexIntro');
    const header = document.getElementById('site-header');
    const skip = document.getElementById('skipIntro');
    const firstSection = document.getElementById('inicio');

    if (!intro) {
      document.body.classList.add('no-intro');
      if (header) header.classList.add('is-visible');
      return;
    }

    const directHash = window.location.hash.replace('#', '').trim();
    const directDeckIds = ['grupo', 'soluciones', 'cobertura', 'industrias', 'certificaciones', 'contacto'];
    if (directDeckIds.includes(directHash)) {
      intro.style.display = 'none';
      intro.style.height = '0';
      intro.style.minHeight = '0';
      intro.setAttribute('aria-hidden', 'true');
      document.body.classList.add('impoex-direct-deck', 'impoex-intro-skipped', 'impoex-intro-passed', 'intro-finished');
      if (header) header.classList.add('is-visible');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setIntroPassed(force = false) {
      const limit = Math.max(0, intro.offsetHeight - window.innerHeight * 0.72);
      const passed = force || window.scrollY >= limit;

      document.body.classList.toggle('impoex-intro-passed', passed);

      if (header && passed) {
        header.classList.add('is-visible');
      }
    }

    if (prefersReducedMotion) {
      document.body.classList.add('impoex-intro-skipped');
      if (header) header.classList.add('is-visible');
    }

    if (skip) {
      skip.addEventListener('click', (event) => {
        event.preventDefault();
        document.body.classList.add('impoex-intro-skipped', 'impoex-intro-passed');

        if (header) header.classList.add('is-visible');

        if (firstSection) {
          firstSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
      });
    }

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIntroPassed(false);
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => setIntroPassed(false));
    setIntroPassed(false);
  }

  function boot() {
    initIntroCleanup();
    initStatsParallax();
    initReveal();
    initSafeHashLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
