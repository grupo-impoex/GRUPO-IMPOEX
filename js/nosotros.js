(function () {
  const revealItems = document.querySelectorAll('.about-reveal, .history-event, .value-card-premium');

  if (revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));
  }

  const timeline = document.getElementById('historyTimeline');
  const progress = document.getElementById('historyProgress');

  if (timeline && progress) {
    const updateProgress = () => {
      const max = timeline.scrollWidth - timeline.clientWidth;
      const percent = max > 0 ? (timeline.scrollLeft / max) * 100 : 100;
      progress.style.setProperty('--history-progress', `${percent}%`);
      progress.style.width = `${percent}%`;
    };

    timeline.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    timeline.addEventListener('pointerdown', (event) => {
      isDown = true;
      timeline.classList.add('is-dragging');
      startX = event.pageX;
      scrollLeft = timeline.scrollLeft;
      timeline.setPointerCapture(event.pointerId);
    });

    timeline.addEventListener('pointermove', (event) => {
      if (!isDown) return;
      const distance = event.pageX - startX;
      timeline.scrollLeft = scrollLeft - distance;
    });

    timeline.addEventListener('pointerup', () => {
      isDown = false;
      timeline.classList.remove('is-dragging');
    });

    timeline.addEventListener('pointerleave', () => {
      isDown = false;
      timeline.classList.remove('is-dragging');
    });
  }

  document.querySelectorAll('.mv-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
})();