/* ---------- Preloader: logo particle explosion ---------- */
(function () {
  const preloader = document.getElementById('preloader');
  const canvas = document.getElementById('preloaderCanvas');
  if (!preloader || !canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    preloader.remove();
    return;
  }

  document.body.classList.add('preloading');

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = Math.round(Math.min(220, window.innerWidth * 0.42));
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';
  ctx.scale(dpr, dpr);

  function finishPreload() {
    preloader.classList.add('preloader-hide');
    document.body.classList.remove('preloading');
    setTimeout(() => preloader.remove(), 650);
  }

  const safetyTimer = setTimeout(finishPreload, 4000);

  const logo = new Image();
  logo.src = 'images/staffle-logo-light.png';

  logo.onload = () => {
    const scale = Math.min(size / logo.width, size / logo.height) * 0.82;
    const w = logo.width * scale;
    const h = logo.height * scale;
    const ox = (size - w) / 2;
    const oy = (size - h) / 2;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(logo, ox, oy, w, h);

    let imgData;
    try {
      imgData = ctx.getImageData(0, 0, size, size).data;
    } catch (err) {
      clearTimeout(safetyTimer);
      setTimeout(finishPreload, 500);
      return;
    }

    const particles = [];
    const step = 3;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const idx = (y * size + x) * 4;
        const alpha = imgData[idx + 3];
        if (alpha > 80) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.4 + Math.random() * 1.4;
          particles.push({
            baseX: x,
            baseY: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: Math.random() * 1.3 + 0.5
          });
        }
      }
    }

    setTimeout(() => {
      clearTimeout(safetyTimer);
      let start = null;
      const duration = 850;

      function animate(ts) {
        if (!start) start = ts;
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2);

        ctx.clearRect(0, 0, size, size);
        particles.forEach(p => {
          const px = p.baseX + p.vx * eased * 70;
          const py = p.baseY + p.vy * eased * 70;
          const a = 1 - eased;
          ctx.fillStyle = 'rgba(90, 219, 200, ' + a + ')';
          ctx.beginPath();
          ctx.arc(px, py, p.r, 0, Math.PI * 2);
          ctx.fill();
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          finishPreload();
        }
      }
      requestAnimationFrame(animate);
    }, 550);
  };

  logo.onerror = () => {
    clearTimeout(safetyTimer);
    finishPreload();
  };
})();
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

  
  /* ---------- Contact form submission ---------- */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      formStatus.textContent = 'Sending...';
      formStatus.className = 'form-status';

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          formStatus.textContent = "Thanks! We'll be in touch within one business day.";
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          formStatus.textContent = 'Something went wrong. Please try again.';
          formStatus.className = 'form-status error';
        }
      } catch (err) {
        formStatus.textContent = 'Something went wrong. Please try again.';
        formStatus.className = 'form-status error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  /* ---------- Talent application form (frontend-only for now, backend wiring comes later) ---------- */
  const applyForm = document.getElementById('applyForm');
  const applyFormStatus = document.getElementById('applyFormStatus');
  if (applyForm) {
    applyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!applyForm.checkValidity()) {
        applyForm.reportValidity();
        return;
      }
      const submitBtn = applyForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      applyFormStatus.textContent = 'Submitting...';
      applyFormStatus.className = 'form-status';

      // NOTE: no backend wired up yet. Once ready, replace this block with a
      // fetch(applyForm.action, { method: 'POST', body: new FormData(applyForm) })
      // call the same way contactForm above does.
      setTimeout(() => {
        applyFormStatus.textContent = "Thanks! Your application has been received. We'll review it and reach out if there's a match.";
        applyFormStatus.className = 'form-status success';
        applyForm.reset();
        submitBtn.disabled = false;
      }, 600);
    });
  }