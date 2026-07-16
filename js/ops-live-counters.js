document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.ops-live-section');
  if (!section) return;

  const cards = Array.from(section.querySelectorAll('[data-live-card]'));
  const timestamp = document.getElementById('opsLiveTimestamp');

  const formatNumber = (number) => {
    return Math.round(number).toLocaleString('es-EC');
  };

  const formatPercent = (number) => {
    return `${number.toFixed(1)}%`;
  };

  const easeOutCubic = (t) => {
    return 1 - Math.pow(1 - t, 3);
  };

  const animateValue = (element, from, to, duration, formatter) => {
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = from + (to - from) * eased;

      element.textContent = formatter(value);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  const updateTimestamp = () => {
    if (!timestamp) return;

    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const initializeCard = (card, index) => {
    const totalEl = card.querySelector('.ops-live-total');
    const percentEl = card.querySelector('.ops-live-percent');

    if (!totalEl || !percentEl) return;

    const isStatic = card.dataset.static === 'true';
    const baseTotal = Number(totalEl.dataset.total || 0);
    const basePercent = Number(percentEl.dataset.percent || 98);

    if (isStatic) {
      totalEl.textContent = String(baseTotal);
      percentEl.textContent = formatPercent(basePercent);
      totalEl.dataset.current = String(baseTotal);
      percentEl.dataset.current = String(basePercent);
      return;
    }

    totalEl.dataset.current = '0';
    percentEl.dataset.current = '0';

    setTimeout(() => {
      animateValue(totalEl, 0, baseTotal, 2600, formatNumber);
      animateValue(percentEl, 0, basePercent, 2600, formatPercent);

      totalEl.dataset.current = String(baseTotal);
      percentEl.dataset.current = String(basePercent);
    }, index * 260);
  };

  const liveUpdateCard = (card) => {
    const isStatic = card.dataset.static === 'true';
    if (isStatic) return;

    const totalEl = card.querySelector('.ops-live-total');
    const percentEl = card.querySelector('.ops-live-percent');
    const progressEl = card.querySelector('.ops-live-progress span');

    if (!totalEl || !percentEl) return;

    const currentTotal = Number(totalEl.dataset.current || totalEl.dataset.total || 0);
    const currentPercent = Number(percentEl.dataset.current || percentEl.dataset.percent || 98);

    const minJump = Number(totalEl.dataset.minJump || 1);
    const maxJump = Number(totalEl.dataset.maxJump || 4);

    const jump = Math.floor(Math.random() * (maxJump - minJump + 1)) + minJump;
    const nextTotal = currentTotal + jump;

    const percentBase = Number(percentEl.dataset.percent || 98);
    const percentVariation = (Math.random() * 0.36) - 0.18;
    const nextPercent = Math.max(96.8, Math.min(99.6, percentBase + percentVariation));

    card.classList.add('is-updating');

    animateValue(totalEl, currentTotal, nextTotal, 1450, formatNumber);
    animateValue(percentEl, currentPercent, nextPercent, 1450, formatPercent);

    totalEl.dataset.current = String(nextTotal);
    percentEl.dataset.current = String(nextPercent);

    if (progressEl) {
      progressEl.style.width = `${nextPercent}%`;
    }

    setTimeout(() => {
      card.classList.remove('is-updating');
    }, 1500);
  };

  let started = false;
  let interval = null;

  const startLiveCounters = () => {
    if (started) return;
    started = true;

    cards.forEach((card, index) => {
      initializeCard(card, index);
    });

    updateTimestamp();

    const dynamicCards = cards.filter(card => card.dataset.static !== 'true');

    interval = setInterval(() => {
      const randomCard = dynamicCards[Math.floor(Math.random() * dynamicCards.length)];

      if (randomCard) {
        liveUpdateCard(randomCard);
      }

      updateTimestamp();
    }, 3600);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startLiveCounters();
      }
    });
  }, {
    threshold: 0.35
  });

  observer.observe(section);

  window.addEventListener('beforeunload', () => {
    if (interval) clearInterval(interval);
  });
});