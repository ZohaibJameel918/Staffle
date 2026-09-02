const navToggle = document.getElementById('navToggle');
  const panel = document.getElementById('mobilePanel');
  const menuIcon = document.getElementById('menuIcon');
  navToggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    menuIcon.innerHTML = isOpen ? '<use href="#ic-close"/>' : '<use href="#ic-menu"/>';
  });
  panel.querySelectorAll('a, .btn').forEach(el => el.addEventListener('click', () => {
    panel.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    menuIcon.innerHTML = '<use href="#ic-menu"/>';
  }));

  /* ---------- Scroll reveal animations ---------- */
  const revealEls = document.querySelectorAll(
    '.section-head, .why-card, .discipline-card, .vet-node, .step, .compare-card, .trust-item, .final-cta h2, .final-cta p, .final-cta .btn-mint'
  );
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));
