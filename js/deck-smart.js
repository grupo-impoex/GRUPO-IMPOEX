/* =========================================================
   CONTROL DECK — Scroll inteligente vertical/horizontal
   - Antes del deck: scroll vertical normal
   - Dentro del deck: navegación horizontal
   - En el primer panel hacia arriba y último hacia abajo: vuelve al scroll vertical
   ========================================================= */
(function () {
  const RESPONSIVE_BREAKPOINT = 1080;
  const isResponsiveMode = () => window.matchMedia(`(max-width: ${RESPONSIVE_BREAKPOINT}px)`).matches;
  const hasGsap = () => typeof gsap !== 'undefined';

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const animateCounter = (el) => {
      if (el.dataset.done === '1') return;
      const target = Number(el.dataset.count);
      if (Number.isNaN(target)) return;
      el.dataset.done = '1';

      const original = el.textContent.trim();
      const prefix = original.startsWith('+') ? '+' : '';
      const suffix = original.includes('%') ? '%' : original.endsWith('+') ? '+' : '';
      const decimals = String(el.dataset.count).includes('.') ? 1 : 0;

      if (hasGsap()) {
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target,
          duration: 1.35,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${prefix}${obj.value.toFixed(decimals)}${suffix && suffix !== '+' ? suffix : ''}${suffix === '+' && !prefix ? '+' : ''}`;
          }
        });
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) animateCounter(entry.target);
      });
    }, { threshold: 0.35 });

    counters.forEach((counter) => observer.observe(counter));
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
    let wheelLock = false;
    let touchStartY = null;
    let touchStartX = null;

    const panelWidth = () => window.innerWidth;

    function resetDeckForResponsive() {
      isAnimating = false;
      if (hasGsap()) gsap.set(track, { clearProps: 'transform' });
      track.style.transform = '';
    }

    function setDeckPosition() {
      if (isResponsiveMode()) {
        resetDeckForResponsive();
        return;
      }
      if (hasGsap()) gsap.set(track, { x: -current * panelWidth() });
      else track.style.transform = `translateX(${-current * panelWidth()}px)`;
    }

    function isDeckLocked() {
      if (isResponsiveMode()) return false;
      const rect = deck.getBoundingClientRect();
      return Math.abs(rect.top) <= 3 && rect.bottom >= window.innerHeight - 3;
    }

    function isDeckNearViewport() {
      const rect = deck.getBoundingClientRect();
      return rect.top <= window.innerHeight * 0.35 && rect.bottom >= window.innerHeight * 0.65;
    }

    function snapDeckToTop() {
      deck.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateUI() {
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
      if (prevBtn) prevBtn.disabled = current === 0;
      if (nextBtn) nextBtn.disabled = current === total - 1;

      if (scrollHint && hasGsap()) {
        gsap.to(scrollHint, { autoAlpha: current === 0 ? 1 : 0, duration: 0.35 });
      }

      const id = panels[current] && (panels[current].dataset.panelId || panels[current].id);
      if (id && history.replaceState && isDeckLocked()) history.replaceState(null, '', `#${id}`);

      document.dispatchEvent(new CustomEvent('impoex:panelchange', { detail: { id, index: current } }));
    }

    function animatePanelIn(panel) {
      if (!panel || !hasGsap()) return;

      const inner = panel.querySelector('.panel-inner');
      const visual = panel.querySelector('.panel-visual, .hero-command, .ecosystem-stack, .service-matrix, .industry-board, .dashboard-card, .lead-form');
      const cards = panel.querySelectorAll('.service-card, .industry-card, .ecosystem-card, .contact-points > *');

      if (inner) {
        gsap.fromTo(inner, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power2.out' });
      }
      if (visual) {
        gsap.fromTo(visual, { autoAlpha: 0, y: 26, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.92, ease: 'power2.out', delay: 0.08 });
      }
      if (cards.length) {
        gsap.fromTo(cards, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, stagger: 0.055, duration: 0.48, ease: 'power2.out', delay: 0.16 });
      }
    }

    function goTo(index) {
      if (isResponsiveMode()) {
        resetDeckForResponsive();
        if (panels[index]) panels[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (index < 0 || index > total - 1 || index === current || isAnimating) return;

      isAnimating = true;
      current = index;

      if (hasGsap()) {
        gsap.to(track, {
          x: -current * panelWidth(),
          duration: 0.95,
          ease: 'power3.inOut',
          onComplete: () => { isAnimating = false; }
        });
      } else {
        track.style.transform = `translateX(${-current * panelWidth()}px)`;
        isAnimating = false;
      }

      animatePanelIn(panels[current]);
      updateUI();
    }

    function goToFromNav(index) {
      if (index < 0 || index > total - 1) return;
      if (isResponsiveMode()) {
        panels[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        current = index;
        updateUI();
        return;
      }

      const locked = isDeckLocked();
      if (!locked) snapDeckToTop();
      window.setTimeout(() => goTo(index), locked ? 0 : 520);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    deck.addEventListener('wheel', (e) => {
      if (isResponsiveMode()) {
        resetDeckForResponsive();
        return;
      }

      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 8) return;

      /* Permite transición vertical natural cuando el deck todavía no está fijado. */
      if (!isDeckLocked()) {
        if (isDeckNearViewport() && delta > 0) {
          e.preventDefault();
          snapDeckToTop();
        }
        return;
      }

      /* Permite salir hacia arriba o hacia abajo del bloque horizontal. */
      if (current === 0 && delta < 0) return;
      if (current === total - 1 && delta > 0) return;

      e.preventDefault();
      if (wheelLock || isAnimating) return;

      wheelLock = true;
      window.setTimeout(() => { wheelLock = false; }, 760);

      delta > 0 ? next() : prev();
    }, { passive: false });

    deck.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    deck.addEventListener('touchend', (e) => {
      if (isResponsiveMode() || touchStartY === null) return;

      const dy = touchStartY - e.changedTouches[0].clientY;
      const dx = touchStartX - e.changedTouches[0].clientX;
      const delta = Math.abs(dy) > Math.abs(dx) ? dy : dx;

      touchStartY = null;
      touchStartX = null;

      if (Math.abs(delta) < 45) return;
      if (!isDeckLocked()) {
        if (delta > 0 && isDeckNearViewport()) snapDeckToTop();
        return;
      }
      if (current === 0 && delta < 0) return;
      if (current === total - 1 && delta > 0) return;

      delta > 0 ? next() : prev();
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (isResponsiveMode() || !isDeckLocked()) return;
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        if (current !== total - 1) { e.preventDefault(); next(); }
      }
      if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        if (current !== 0) { e.preventDefault(); prev(); }
      }
    });

    if (nextBtn) nextBtn.addEventListener('click', () => goToFromNav(current + 1));
    if (prevBtn) prevBtn.addEventListener('click', () => goToFromNav(current - 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToFromNav(i)));

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        if (!id) return;

        if (id === 'inicio') return;

        const index = panels.findIndex((panel) => panel.dataset.panelId === id || panel.id === id);
        if (index === -1) return;

        e.preventDefault();
        goToFromNav(index);
      });
    });

    window.addEventListener('resize', setDeckPosition);

    const initialId = window.location.hash.replace('#', '');
    const initialIndex = panels.findIndex((panel) => panel.dataset.panelId === initialId || panel.id === initialId);
    if (initialIndex > -1) {
      current = initialIndex;
      if (!isResponsiveMode()) {
        window.setTimeout(() => {
          snapDeckToTop();
          setDeckPosition();
        }, 120);
      }
    } else {
      setDeckPosition();
    }

    updateUI();
    animatePanelIn(panels[current]);
  }

  function initSpotlightCards() {
    document.querySelectorAll('.spotlight-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  function initTilt() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.querySelectorAll('[data-tilt]').forEach((item) => {
      item.addEventListener('pointermove', (e) => {
        if (isResponsiveMode()) return;
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        item.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-2px)`;
      });
      item.addEventListener('pointerleave', () => { item.style.transform = ''; });
    });
  }

  function initMagneticButtons() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        if (isResponsiveMode()) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  function boot() {
    initCounters();
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
