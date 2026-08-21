/* =========================================================
   CONTROL DECK — Navegación horizontal, hover premium y responsive
   Grupo Impoex Premium
   ========================================================= */

(function () {
  const MOBILE_BREAKPOINT = 1080;
  const responsiveQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

  function isResponsiveMode() {
    return responsiveQuery.matches;
  }

  function initDeck() {
    const deck = document.getElementById('control-deck');
    if (!deck) return;

    const track = document.getElementById('deck-track');
    if (!track) return;

    const panels = Array.from(track.children);
    const total = panels.length;
    if (!total) return;

    const prevBtn = document.getElementById('deck-prev');
    const nextBtn = document.getElementById('deck-next');
    const dots = Array.from(document.querySelectorAll('.deck-dot'));
    const scrollHint = document.getElementById('scroll-hint');

    let current = 0;
    let isAnimating = false;
    let touchStartY = null;
    let touchStartX = null;
    let wheelLock = false;

    const hasGsap = typeof gsap !== 'undefined';
    const panelWidth = () => window.innerWidth;

    function resetDeckForResponsive() {
      isAnimating = false;

      if (hasGsap) {
        gsap.set(track, { clearProps: 'transform' });
      }

      track.style.transform = '';
    }

    function setDeckPosition() {
      if (isResponsiveMode()) {
        resetDeckForResponsive();
        return;
      }

      if (hasGsap) {
        gsap.set(track, { x: -current * panelWidth() });
      } else {
        track.style.transform = `translateX(${-current * panelWidth()}px)`;
      }
    }

    function updateTopNavActive(id) {
      if (!id) return;

      const navLinks = document.querySelectorAll('.site-nav a');

      navLinks.forEach(link => {
        link.classList.remove('active');
      });

      const matchingLinks = document.querySelectorAll(
        id === 'contacto'
          ? `.site-nav a[href="#${id}"], .site-nav a[href="index.html#${id}"], .site-nav a[href="contacto.html"]`
          : `.site-nav a[href="#${id}"], .site-nav a[href="index.html#${id}"]`
      );

      matchingLinks.forEach(link => {
        link.classList.add('active');
      });
    }

    function updateUI() {
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
      });

      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;

      if (scrollHint && hasGsap) {
        gsap.to(scrollHint, {
          autoAlpha: current === 0 && !isResponsiveMode() ? 1 : 0,
          duration: 0.35
        });
      }

      const id = panels[current] && (panels[current].dataset.panelId || panels[current].id);

      if (id && history.replaceState && !isResponsiveMode()) {
        history.replaceState(null, '', `#${id}`);
      }

      updateTopNavActive(id);

      document.dispatchEvent(
        new CustomEvent('impoex:panelchange', {
          detail: { id, index: current }
        })
      );
    }

    function animateNumbers(panel) {
      if (!panel || !hasGsap) return;

      const nums = panel.querySelectorAll('[data-count]');

      nums.forEach(el => {
        const raw = el.dataset.count;
        const target = Number(raw);

        if (Number.isNaN(target) || el.dataset.done === '1') return;

        el.dataset.done = '1';

        const originalText = el.textContent.trim();
        const hasPercent = originalText.includes('%');
        const hasPlusPrefix = originalText.startsWith('+');
        const hasPlusSuffix = originalText.endsWith('+');
        const decimals = String(raw).includes('.') ? 1 : 0;

        const obj = { value: 0 };

        gsap.to(obj, {
          value: target,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            let value = obj.value.toFixed(decimals);

            if (hasPlusPrefix) value = `+${value}`;
            if (hasPlusSuffix && !hasPlusPrefix) value = `${value}+`;
            if (hasPercent) value = `${value}%`;

            el.textContent = value;
          }
        });
      });
    }

    function animatePanelIn(panel) {
      if (!panel) return;

      animateNumbers(panel);

      if (!hasGsap) return;

      const inner = panel.querySelector('.panel-inner');

      const visual = panel.querySelector(
        '.panel-visual, .hero-command, .ecosystem-stack, .service-matrix, .industry-board, .dashboard-card, .lead-form, .cert-premium-grid, .cert-premium-visual'
      );

      const cards = panel.querySelectorAll(
        '.service-card, .industry-card, .ecosystem-card, .contact-points > *, .cert-premium-card, .cert-premium-points article'
      );

      if (inner) {
        gsap.fromTo(
          inner,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            ease: 'power2.out'
          }
        );
      }

      if (visual) {
        gsap.fromTo(
          visual,
          { autoAlpha: 0, y: 26, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.92,
            ease: 'power2.out',
            delay: 0.08
          }
        );
      }

      if (cards.length) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.055,
            duration: 0.48,
            ease: 'power2.out',
            delay: 0.16
          }
        );
      }
    }

    function forcePanelContent(panel) {
      if (!panel) return;

      panel.querySelectorAll(
        '.reveal-up, .spotlight-card, .panel-inner, .cert-premium-grid, .cert-premium-copy, .cert-premium-visual, .cert-premium-card, .cert-card-inner'
      ).forEach(el => {
        el.classList.add('is-visible');

        if (hasGsap) {
          gsap.set(el, {
            autoAlpha: 1,
            y: 0,
            scale: 1
          });
        }
      });
    }

    function goTo(index) {
      if (isResponsiveMode()) {
        resetDeckForResponsive();
        return;
      }

      if (index < 0 || index > total - 1 || index === current || isAnimating) return;

      isAnimating = true;
      current = index;

      if (hasGsap) {
        gsap.to(track, {
          x: -current * panelWidth(),
          duration: 0.95,
          ease: 'power3.inOut',
          onComplete: () => {
            isAnimating = false;
          }
        });
      } else {
        track.style.transform = `translateX(${-current * panelWidth()}px)`;
        isAnimating = false;
      }

      animatePanelIn(panels[current]);
      forcePanelContent(panels[current]);
      updateUI();
    }

    function scrollToPanelMobile(index) {
      if (index < 0 || index > total - 1) return;

      current = index;
      resetDeckForResponsive();
      updateUI();

      panels[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      const id = panels[index].dataset.panelId || panels[index].id;

      if (id && history.replaceState) {
        history.replaceState(null, '', `#${id}`);
      }

      forcePanelContent(panels[index]);
    }

    function goToHashPanel(rawHash) {
      const id = String(rawHash || '').replace('#', '').trim();
      if (!id) return false;

      const index = panels.findIndex(panel => {
        return panel.dataset.panelId === id || panel.id === id;
      });

      if (index === -1) return false;

      if (isResponsiveMode()) {
        current = index;
        resetDeckForResponsive();
        updateUI();

        window.setTimeout(() => {
          panels[current].scrollIntoView({
            behavior: 'auto',
            block: 'start'
          });
        }, 80);

        forcePanelContent(panels[current]);
        return true;
      }

      if (hasGsap) {
        gsap.killTweensOf(track);
      }

      isAnimating = false;
      current = index;

      const deckTop = deck.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: deckTop,
        behavior: 'auto'
      });

      setDeckPosition();
      updateUI();
      animatePanelIn(panels[current]);
      forcePanelContent(panels[current]);

      return true;
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function isDeckVisible() {
      const rect = deck.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom >= window.innerHeight * 0.5;
    }

    /* -----------------------------------------
       Scroll mouse / trackpad
       ----------------------------------------- */

    deck.addEventListener(
      'wheel',
      e => {
        if (isResponsiveMode()) {
          resetDeckForResponsive();
          return;
        }

        e.preventDefault();

        if (wheelLock) return;

        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

        if (Math.abs(delta) < 8) return;

        wheelLock = true;

        window.setTimeout(() => {
          wheelLock = false;
        }, 720);

        delta > 0 ? next() : prev();
      },
      { passive: false }
    );

    /* -----------------------------------------
       Touch móvil / tablet
       ----------------------------------------- */

    deck.addEventListener(
      'touchstart',
      e => {
        if (isResponsiveMode()) {
          resetDeckForResponsive();
          return;
        }

        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      },
      { passive: true }
    );

    deck.addEventListener(
      'touchend',
      e => {
        if (isResponsiveMode()) {
          resetDeckForResponsive();
          return;
        }

        if (touchStartY === null) return;

        const dy = touchStartY - e.changedTouches[0].clientY;
        const dx = touchStartX - e.changedTouches[0].clientX;
        const delta = Math.abs(dy) > Math.abs(dx) ? dy : dx;

        if (Math.abs(delta) > 45) {
          delta > 0 ? next() : prev();
        }

        touchStartY = null;
        touchStartX = null;
      },
      { passive: true }
    );

    /* -----------------------------------------
       Teclado
       ----------------------------------------- */

    window.addEventListener('keydown', e => {
      if (isResponsiveMode()) return;
      if (!isDeckVisible()) return;

      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        next();
      }

      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        prev();
      }
    });

    /* -----------------------------------------
       Botones y dots
       ----------------------------------------- */

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (isResponsiveMode()) {
          scrollToPanelMobile(current + 1);
          return;
        }

        next();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (isResponsiveMode()) {
          scrollToPanelMobile(current - 1);
          return;
        }

        prev();
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        if (isResponsiveMode()) {
          scrollToPanelMobile(i);
          return;
        }

        goTo(i);
      });
    });

    /* -----------------------------------------
       Links internos y links tipo index.html#seccion
       ----------------------------------------- */

    document.querySelectorAll('a[href*="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const rawHref = link.getAttribute('href');
        if (!rawHref || rawHref === '#') return;

        const url = new URL(rawHref, window.location.href);

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const targetPath = url.pathname.split('/').pop() || 'index.html';

        const isSamePage =
          currentPath === targetPath ||
          (currentPath === '' && targetPath === 'index.html') ||
          (currentPath === 'index.html' && targetPath === '');

        if (!isSamePage) return;

        const id = url.hash.replace('#', '');
        if (!id) return;

        const index = panels.findIndex(panel => {
          return panel.dataset.panelId === id || panel.id === id;
        });

        if (index === -1) return;

        e.preventDefault();

        if (history.pushState) {
          history.pushState(null, '', `#${id}`);
        }

        if (isResponsiveMode()) {
          scrollToPanelMobile(index);
          return;
        }

        goTo(index);
      });
    });

    /* -----------------------------------------
       Resize
       ----------------------------------------- */

    let wasResponsive = isResponsiveMode();

    window.addEventListener('resize', () => {
      const nowResponsive = isResponsiveMode();

      if (nowResponsive) {
        resetDeckForResponsive();
      } else {
        setDeckPosition();
      }

      if (wasResponsive !== nowResponsive) {
        updateUI();
      }

      wasResponsive = nowResponsive;
    });

    /* -----------------------------------------
       Hash inicial y navegación desde páginas internas
       ----------------------------------------- */

    const storedHash = sessionStorage.getItem('impoex_target_hash');
    if (storedHash) {
      sessionStorage.removeItem('impoex_target_hash');
    }

    const initialHash = storedHash || window.location.hash;

    if (initialHash) {
      goToHashPanel(initialHash);

      window.setTimeout(() => {
        goToHashPanel(window.location.hash);
      }, 160);

      window.setTimeout(() => {
        goToHashPanel(window.location.hash);
      }, 520);

      window.setTimeout(() => {
        goToHashPanel(window.location.hash);
      }, 1000);
    } else {
      setDeckPosition();
      updateUI();
      animatePanelIn(panels[current]);
      forcePanelContent(panels[current]);
    }

    window.addEventListener('hashchange', () => {
      window.setTimeout(() => {
        goToHashPanel(window.location.hash);
      }, 80);
    });
  }

  /* =========================================================
     Spotlight premium cards
     ========================================================= */

  function initSpotlightCards() {
    document.querySelectorAll('.spotlight-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();

        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  /* =========================================================
     Tilt premium
     ========================================================= */

  function initTilt() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    document.querySelectorAll('[data-tilt]').forEach(item => {
      item.addEventListener('pointermove', e => {
        if (isResponsiveMode()) return;

        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        item.style.transform = `
          perspective(1000px)
          rotateY(${x * 5}deg)
          rotateX(${-y * 5}deg)
          translateY(-2px)
        `;
      });

      item.addEventListener('pointerleave', () => {
        item.style.transform = '';
      });
    });
  }

  /* =========================================================
     Magnetic buttons
     ========================================================= */

  function initMagneticButtons() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        if (isResponsiveMode()) return;

        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
      });

      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* =========================================================
     Boot
     ========================================================= */

  function boot() {
    initDeck();
    initSpotlightCards();
    initTilt();
    initMagneticButtons();
  }

  if (document.getElementById('intro')) {
    document.addEventListener('impoex:ready', boot, { once: true });
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
})();