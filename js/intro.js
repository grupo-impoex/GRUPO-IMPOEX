/* =========================================================
   INTRO — Secuencia de apertura
   ========================================================= */
(function () {
  function playIntro(onComplete) {
    const intro = document.getElementById('intro');
    if (!intro) { onComplete(); return; }

    const logoWrapper = document.getElementById('logo-wrapper');
    const simbolo = document.getElementById('simbolo-agrupado');
    const ring = document.getElementById('coord-ring');
    const brandText = document.querySelector('.brand-text');
    const holdingText = document.querySelector('.holding-text');
    const skipBtn = document.getElementById('intro-skip');
    const certs = document.getElementById('intro-certs');

    document.body.classList.add('intro-locked');
    const seen = sessionStorage.getItem('impoex_intro_seen');

    const finish = () => {
      document.body.classList.remove('intro-locked');
      intro.style.display = 'none';
      intro.setAttribute('aria-hidden', 'true');
      sessionStorage.setItem('impoex_intro_seen', '1');
      onComplete();
    };

    if (typeof gsap === 'undefined') {
      finish();
      return;
    }

    gsap.set(simbolo, { transformOrigin: '420px 450px' });

    const tl = gsap.timeline({ onComplete: finish });

    tl.to(logoWrapper, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' })
      .add(() => intro.style.setProperty('--radar-op', '1'), 0)
      .fromTo(ring, { autoAlpha: 0, rotation: -35, scale: 0.9 }, { autoAlpha: 1, rotation: 0, scale: 1, duration: 1.1, ease: 'power2.out' }, 0.05)
      .fromTo(simbolo, { rotation: -85, scale: 0.84 }, { rotation: 0, scale: 1, duration: 1.15, ease: 'power3.inOut' }, 0.1)
      .to(brandText, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
      .to(holdingText, { opacity: 1, y: 0, duration: 0.58, ease: 'power2.out' }, '-=0.42')
      .to(certs, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' }, '-=0.25')
      .to(ring, { rotation: 110, duration: 2, ease: 'none' }, '-=0.9')
      .to(skipBtn, { autoAlpha: 1, duration: 0.36 }, '-=1.6')
      .to({}, { duration: seen ? 0.15 : 0.82 })
      .to(intro, { yPercent: -100, duration: 1.0, ease: 'power4.inOut' });

    if (seen) tl.timeScale(2.5);

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        tl.kill();
        gsap.to(intro, { autoAlpha: 0, duration: 0.42, onComplete: finish });
      }, { once: true });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('site-header');
    const intro = document.getElementById('intro');

    const reveal = () => {
      if (header) header.classList.add('is-visible');
      document.dispatchEvent(new CustomEvent('impoex:ready'));
    };

    if (!intro) { reveal(); return; }

    const safetyTimer = setTimeout(() => {
      intro.style.display = 'none';
      document.body.classList.remove('intro-locked');
      reveal();
    }, 8500);

    playIntro(() => {
      clearTimeout(safetyTimer);
      reveal();
    });
  });
})();
