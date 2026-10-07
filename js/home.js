// Staffle homepage interactions and animations
// Text load animation: words rise up one by one
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const targets = [
    ['.hero h1', 80, 200, 'load'],
    ['.hero-what .label', 70, 700, 'load'],
    ['.hero-what p', 22, 850, 'load'],
    ['.arcs h2', 70, 0],
    ['.wf-label', 70, 0],
    ['.wf-head h2', 60, 150],
    ['.roster > h2', 70, 0],
    ['.faq-title h2', 90, 0],
    ['.cta-head h2', 80, 0],
    ['.nav-links a, .nav-t', 60, 300, 'load'],
    ['.wf-count', 60, 300],
    ['.wf-slide h3', 70, 0],
    ['.wf-slide p', 22, 250],
    ['.tabs button', 50, 0],
    ['.card .role-t', 60, 250],
    ['.card .name', 60, 450],
    ['.card .meta', 50, 550],
    ['.intro', 60, 400],
    ['.view-more', 60, 300],
    ['.faq-num', 60, 0],
    ['.faq-q', 60, 150],
    ['.faq-a > span', 18, 100],
    ['.ft-note', 60, 0],
    ['.ft-mail-t', 60, 100],
    ['.ft-links a, .ft-copy', 40, 200]
  ];
  const finish = (el) => {
    const n = el.querySelectorAll('.wi').length;
    const step = parseFloat(el.style.getPropertyValue('--step')) || 70, base = parseFloat(el.style.getPropertyValue('--base')) || 0;
    clearTimeout(el._doneT);
    el.classList.remove('text-done');
    el._doneT = setTimeout(() => el.classList.add('text-done'), base + step * n + 1200);
  };
  const split = (el) => {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi';
            wi.style.setProperty('--i', n++); wi.textContent = part;
            w.appendChild(wi); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
  };
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); finish(e.target); } });
  }, { threshold: 0.3 }) : null;
  window.revealText = (el, step = 60, base = 0) => {
    el.classList.remove('revealed');
    split(el);
    el.style.setProperty('--step', step + 'ms');
    el.style.setProperty('--base', base + 'ms');
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('revealed'); finish(el); }));
  };
  targets.forEach(([sel, step, base, mode]) => {
    document.querySelectorAll(sel).forEach(el => {
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      split(el);
      el.style.setProperty('--step', step + 'ms');
      el.style.setProperty('--base', base + 'ms');
      if (mode === 'load' || !io) {
        requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add('revealed'); finish(el); }));
      } else { io.observe(el); }
    });
  });
})();

// Hero video: make sure the muted background loop starts (some browsers wait for a first interaction)
(() => {
  const v = document.querySelector('.hero-video');
  if (!v) return;
  v.muted = true;
  const play = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
  play();
  ['pointerdown', 'scroll', 'keydown', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, () => { if (v.paused) play(); }, { once: true, passive: true }));
})();

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('mobileMenu');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false');
}));

// Roles strip: letters roll up into teal on hover only
const roleItems = document.querySelectorAll('.roles li');
roleItems.forEach(li => {
  const text = li.textContent;
  li.setAttribute('aria-label', text);
  li.innerHTML = '<span class="roll" aria-hidden="true">' + [...text].map((c, i) =>
    '<span class="ch" style="--d:' + i + '">' + (c === ' ' ? '&nbsp;' : c) + '</span>').join('') + '</span>';
  li.addEventListener('mouseenter', () => li.classList.add('active'));
  li.addEventListener('mouseleave', () => li.classList.remove('active'));
});

// Footer wordmark: letters rise one by one when it scrolls into view
const ftMark = document.querySelector('.ft-mark');
if (ftMark) {
  ftMark.querySelectorAll('.ft-word > *').forEach((l, i) => { l.style.transitionDelay = (i * 0.08) + 's'; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { ftMark.classList.add('in'); obs.disconnect(); } });
    }, { threshold: 0.4 }).observe(ftMark);
  } else { ftMark.classList.add('in'); }
}

// Arcs reveal (one-time)
const arcs = document.getElementById('arcs');
if ('IntersectionObserver' in window) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { arcs.classList.remove('pre'); obs.disconnect(); } });
  }, { threshold: 0.35 }).observe(arcs);
} else { arcs.classList.remove('pre'); }

// Cards: drop in one by one as they scroll into view, plus sideways scrolling (drag, arrows, trackpad)
const cardsEl = document.getElementById('cards');
const cardWraps = [...cardsEl.querySelectorAll('.card-wrap')];
const reduceCards = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceCards) {
  cardWraps.forEach(w => w.classList.add('pre'));
  let batch = 0, batchT = 0;
  const cardIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const w = e.target;
      w.style.setProperty('--dl', (batch++ * 0.45) + 's');
      clearTimeout(batchT); batchT = setTimeout(() => { batch = 0; }, 400);
      w.classList.remove('pre'); w.classList.add('in');
      cardIO.unobserve(w);
    });
  }, { root: cardsEl, threshold: 0.1 });
  // start watching only once the section reaches the screen, so the first cards drop when visible
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { cardWraps.forEach(w => cardIO.observe(w)); obs.disconnect(); } });
  }, { threshold: 0, rootMargin: '0px 0px -20% 0px' }).observe(cardsEl);
}

// Hover: the badge sways gently left and right on its lanyard, and settles back when the cursor leaves
if (!reduceCards && window.matchMedia('(hover: hover)').matches) {
  const PERIOD = 3200, MAX_DEG = 2.4;
  cardWraps.forEach(w => {
    const badge = w.querySelector('.badge');
    let amp = 0, target = 0, phase = 0, last = 0, raf = 0;
    const tick = (now) => {
      const dt = last ? Math.min(now - last, 50) : 16; last = now;
      amp += (target - amp) * (target ? 0.035 : 0.025);
      phase += dt / PERIOD * Math.PI * 2;
      badge.style.transform = `rotate(${(amp * Math.sin(phase)).toFixed(3)}deg)`;
      if (!target && amp < 0.02) { badge.style.transform = ''; raf = 0; last = 0; phase = 0; return; }
      raf = requestAnimationFrame(tick);
    };
    w.addEventListener('mouseenter', () => { target = MAX_DEG; if (!raf) raf = requestAnimationFrame(tick); });
    w.addEventListener('mouseleave', () => { target = 0; });
  });
}

// sideways scrolling helpers
const cardsPrev = document.getElementById('cardsPrev'), cardsNext = document.getElementById('cardsNext'), cardsBar = document.getElementById('cardsBar');
const cardStep = () => { const w = cardWraps.find(x => !x.hidden); return w ? w.getBoundingClientRect().width + parseFloat(getComputedStyle(cardsEl).columnGap || 40) : 300; };
const updateCardsNav = () => {
  const max = cardsEl.scrollWidth - cardsEl.clientWidth;
  cardsPrev.disabled = cardsEl.scrollLeft <= 2;
  cardsNext.disabled = cardsEl.scrollLeft >= max - 2;
  const vis = max > 0 ? cardsEl.clientWidth / cardsEl.scrollWidth : 1;
  cardsBar.style.width = (vis * 100) + '%';
  cardsBar.style.transform = `translateX(${max > 0 ? (cardsEl.scrollLeft / max) * ((1 - vis) / vis) * 100 : 0}%)`;
};
cardsPrev.addEventListener('click', () => cardsEl.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
cardsNext.addEventListener('click', () => cardsEl.scrollBy({ left: cardStep(), behavior: 'smooth' }));
cardsEl.addEventListener('scroll', updateCardsNav, { passive: true });
window.addEventListener('resize', updateCardsNav);
cardsEl.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); cardsNext.click(); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); cardsPrev.click(); }
});
// drag with the mouse
let dragX = null, dragStart = 0, dragMoved = false;
cardsEl.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  dragX = e.clientX; dragStart = cardsEl.scrollLeft; dragMoved = false;
});
window.addEventListener('pointermove', (e) => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  if (!dragMoved && Math.abs(dx) > 5) { dragMoved = true; cardsEl.classList.add('dragging'); }
  if (dragMoved) cardsEl.scrollLeft = dragStart - dx;
});
window.addEventListener('pointerup', () => {
  if (dragX === null) return;
  dragX = null;
  if (dragMoved) {
    cardsEl.classList.remove('dragging');
    const s = cardStep(); cardsEl.scrollTo({ left: Math.round(cardsEl.scrollLeft / s) * s, behavior: 'smooth' });
  }
});
cardsEl.addEventListener('click', (e) => { if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; } }, true);
updateCardsNav();

// FAQ rings: draw one by one, then fade out one by one, and repeat
const faqTitle = document.getElementById('faqTitle');
const rings = faqTitle.querySelectorAll('.ring');
const CYCLE = 8000, DRAW = 1600, DRAW_GAP = 800, FADE_START = 4600, FADE = 800, FADE_GAP = 500;
const startRings = () => {
  rings.forEach((r, i) => {
    const d0 = i * DRAW_GAP, d1 = d0 + DRAW, f0 = FADE_START + i * FADE_GAP, f1 = f0 + FADE;
    r.animate([
      { offset: 0, strokeDashoffset: 1, opacity: 1 },
      { offset: d0 / CYCLE, strokeDashoffset: 1, opacity: 1, easing: 'cubic-bezier(.45,0,.25,1)' },
      { offset: d1 / CYCLE, strokeDashoffset: 0, opacity: 1 },
      { offset: f0 / CYCLE, strokeDashoffset: 0, opacity: 1, easing: 'ease-out' },
      { offset: f1 / CYCLE, strokeDashoffset: 0, opacity: 0 },
      { offset: 1, strokeDashoffset: 0, opacity: 0 }
    ], { duration: CYCLE, iterations: Infinity });
  });
};
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { startRings(); obs.disconnect(); } });
    }, { threshold: 0.4 }).observe(faqTitle);
  } else { startRings(); }
}

// Workflow shapes: on hover they fall with gravity, pile up, and can be pushed; they float back when the cursor leaves
(() => {
  const svg = document.getElementById('wfShapes');
  const area = svg && svg.closest('.wf-art');
  if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  svg.style.overflow = 'visible';
  // world bounds come from the SVG viewBox: left wall, right wall, floor
  const vb = svg.viewBox.baseVal, X0 = vb.x, W = vb.x + vb.width, H = vb.y + vb.height;
  const G = 0.45 * (vb.width / 383), E = 0.25, MU = 0.35;
  // each shape carries its own collision circles [offsetX, offsetY, radius] relative to its centre (data-hull)
  const bodies = [...svg.querySelectorAll('.shape')].map((g) => {
    const cx = +g.dataset.cx, cy = +g.dataset.cy, circles = JSON.parse(g.dataset.hull), dens = +(g.dataset.dens || 1);
    let m = 0, I = 0;
    circles.forEach(([ox, oy, r]) => { const cm = r * r * dens; m += cm; I += cm * (r * r / 2 + ox * ox + oy * oy); });
    return { g, cx, cy, circles, x: cx, y: cy, a: 0, vx: 0, vy: 0, w: 0, im: 1 / m, iI: 1 / I };
  });
  let mode = 'rest', raf = 0, leaveTimer = 0, back = null, last = null;

  const draw = () => bodies.forEach(b => b.g.setAttribute('transform',
    `translate(${(b.x - b.cx).toFixed(2)} ${(b.y - b.cy).toFixed(2)}) rotate(${(b.a * 180 / Math.PI).toFixed(2)} ${b.cx} ${b.cy})`));

  const worldCircles = (b) => {
    const c = Math.cos(b.a), s = Math.sin(b.a);
    return b.circles.map(([ox, oy, r]) => ({ rx: ox * c - oy * s, ry: ox * s + oy * c, r }));
  };
  const resolve = (A, B, rA, rB, nx, ny, pen) => {
    // relative velocity at contact
    const vAx = A.vx - A.w * rA.y, vAy = A.vy + A.w * rA.x;
    const vBx = B ? B.vx - B.w * rB.y : 0, vBy = B ? B.vy + B.w * rB.x : 0;
    const rvx = vAx - vBx, rvy = vAy - vBy, vn = rvx * nx + rvy * ny;
    const imB = B ? B.im : 0, iIB = B ? B.iI : 0;
    const rnA = rA.x * ny - rA.y * nx, rnB = B ? rB.x * ny - rB.y * nx : 0;
    if (vn < 0) {
      const j = -(1 + E) * vn / (A.im + imB + rnA * rnA * A.iI + rnB * rnB * iIB);
      let tx = rvx - vn * nx, ty = rvy - vn * ny; const tl = Math.hypot(tx, ty);
      let jt = 0;
      if (tl > 1e-6) {
        tx /= tl; ty /= tl;
        const rtA = rA.x * ty - rA.y * tx, rtB = B ? rB.x * ty - rB.y * tx : 0;
        jt = Math.max(-MU * j, Math.min(MU * j, -(rvx * tx + rvy * ty) / (A.im + imB + rtA * rtA * A.iI + rtB * rtB * iIB)));
      }
      const px = j * nx + jt * tx, py = j * ny + jt * ty;
      A.vx += px * A.im; A.vy += py * A.im; A.w += (rA.x * py - rA.y * px) * A.iI;
      if (B) { B.vx -= px * B.im; B.vy -= py * B.im; B.w -= (rB.x * py - rB.y * px) * B.iI; }
    }
    // positional correction
    const corr = Math.max(pen - 0.2, 0) * 0.6 / (A.im + imB);
    A.x += nx * corr * A.im; A.y += ny * corr * A.im;
    if (B) { B.x -= nx * corr * B.im; B.y -= ny * corr * B.im; }
  };
  const step = () => {
    bodies.forEach(b => {
      b.vy += G; b.vx *= 0.998; b.vy *= 0.998; b.w *= 0.985;
      b.x += b.vx; b.y += b.vy; b.a += b.w;
    });
    for (let it = 0; it < 12; it++) {
      const wc = bodies.map(worldCircles);
      bodies.forEach((A, i) => {
        wc[i].forEach(c => {
          const px = A.x + c.rx, py = A.y + c.ry, rA = { x: c.rx, y: c.ry };
          if (py + c.r > H) resolve(A, null, { x: c.rx, y: c.ry + c.r }, null, 0, -1, py + c.r - H);
          if (px - c.r < X0) resolve(A, null, { x: c.rx - c.r, y: c.ry }, null, 1, 0, X0 + c.r - px);
          if (px + c.r > W) resolve(A, null, { x: c.rx + c.r, y: c.ry }, null, -1, 0, px + c.r - W);
          for (let k = i + 1; k < bodies.length; k++) {
            const B = bodies[k];
            wc[k].forEach(d => {
              const qx = B.x + d.rx, qy = B.y + d.ry;
              let dx = px - qx, dy = py - qy; const dist = Math.hypot(dx, dy) || 0.001, pen = c.r + d.r - dist;
              if (pen <= 0) return;
              dx /= dist; dy /= dist;
              const cxp = px - dx * c.r, cyp = py - dy * c.r;
              resolve(A, B, { x: cxp - A.x, y: cyp - A.y }, { x: cxp - B.x, y: cyp - B.y }, dx, dy, pen);
            });
          }
        });
      });
    }
  };
  const loop = (t) => {
    if (mode === 'fall') step();
    else if (mode === 'back') {
      const k = Math.min(1, (t - back.t0) / 1200), e = 1 - Math.pow(1 - k, 3);
      bodies.forEach((b, i) => { const s0 = back.from[i]; b.x = s0.x + (b.cx - s0.x) * e; b.y = s0.y + (b.cy - s0.y) * e; b.a = s0.a * (1 - e); });
      if (k === 1) { mode = 'rest'; bodies.forEach(b => { b.vx = b.vy = b.w = 0; }); }
    }
    draw();
    raf = mode === 'rest' ? 0 : requestAnimationFrame(loop);
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };

  area.addEventListener('mouseenter', () => {
    clearTimeout(leaveTimer);
    if (mode !== 'fall') { mode = 'fall'; start(); }
  });
  area.addEventListener('mousemove', (e) => {
    const p = toSvg(e);
    if (last && mode === 'fall') {
      const lim = 30 * (vb.width / 383), mdx = Math.max(-lim, Math.min(lim, p.x - last.x)), mdy = Math.max(-lim, Math.min(lim, p.y - last.y));
      bodies.forEach(b => {
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
        const R = 130 * (vb.width / 383);
        if (d > R) return;
        const f = 1 - d / R;
        b.vx += (dx / d * 1.2 * (vb.width / 383) + mdx * 0.35) * f;
        b.vy += (dy / d * 1.2 * (vb.width / 383) + mdy * 0.35) * f;
        b.w += ((dx * mdy - dy * mdx) / d) * 0.0015 * f;
      });
    }
    last = p;
  });
  area.addEventListener('mouseleave', () => {
    last = null;
    leaveTimer = setTimeout(() => {
      back = { t0: performance.now(), from: bodies.map(b => ({ x: b.x, y: b.y, a: b.a })) };
      mode = 'back'; start();
    }, 1500);
  });
})();

// Workflow slider
const steps = [
  { title: 'Scope &amp;<br>Requirement Intake', text: 'We review your technical requirements, expected timezone overlap, team workflow, and budget parameters to formulate a concrete role profile.' },
  { title: 'Sourcing &amp;<br>Technical Vetting', text: 'We source candidates and have specialists from the same discipline assess their real work, then send you a shortlist of people who clear the bar.' },
  { title: 'Onboarding &amp;<br>Ongoing Management', text: 'Once you choose your hire, we handle the contract, billing, and payroll while they work as a dedicated member of your team.' }
];
let step = 0;
const slide = document.getElementById('wfSlide');
const show = i => {
  step = (i + steps.length) % steps.length;
  slide.classList.add('fading');
  setTimeout(() => {
    const tEl = document.getElementById('wfTitle'), pEl = document.getElementById('wfText');
    tEl.innerHTML = steps[step].title;
    pEl.textContent = steps[step].text;
    if (window.revealText) { window.revealText(tEl, 70, 0); window.revealText(pEl, 22, 250); }
    document.getElementById('wfNum').textContent = String(step + 1).padStart(2, '0');
    slide.classList.remove('fading');
  }, 300);
};
document.getElementById('wfPrev').addEventListener('click', () => show(step - 1));
document.getElementById('wfNext').addEventListener('click', () => show(step + 1));

// Roster filter
const tabs = document.querySelectorAll('.tabs button');
const wraps = document.querySelectorAll('.card-wrap');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.setAttribute('aria-selected', x === t));
  const f = t.dataset.filter; let shown = 0;
  wraps.forEach(w => { const ok = f === 'all' || w.dataset.cat === f; w.hidden = !ok; if (ok) shown++; });
  document.getElementById('noMatch').hidden = shown > 0;
  cardsEl.scrollTo({ left: 0 });
  wraps.forEach(w => { if (!w.hidden && w.classList.contains('pre')) { w.classList.remove('pre'); w.classList.add('in'); } });
  updateCardsNav();
}));

// FAQ columns
const cols = document.querySelectorAll('.faq-col');
const openCol = c => cols.forEach(x => x.setAttribute('aria-expanded', x === c));
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
cols.forEach(c => {
  c.addEventListener('click', () => openCol(c));
  c.addEventListener('focus', () => openCol(c));
  if (canHover) c.addEventListener('mouseenter', () => openCol(c));
});

// ---------- Full roster popup (opens from "view more") ----------
(() => {
  const modal = document.getElementById('rosterModal');
  if (!modal) return;

  // Edit this list to add, remove or change candidates
  const CANDIDATES = [
    { id: 'DES-204', cat: 'design', title: 'Lead UI/UX & Brand Designer', years: '7+', hours: 40, remote: 'US EST / PST Overlap',
      summary: 'Specialized in scalable design systems, B2B SaaS workflows, and high-conversion brand collateral. Proven at taking products from rough wireframes to polished, developer-ready interfaces.',
      skills: ['Figma', 'Design Systems', 'UI/UX Architecture', 'Prototyping'],
      highlights: ['Built and maintained component libraries used across multiple product teams', 'Led end-to-end redesigns of SaaS dashboards and onboarding flows', 'Comfortable presenting work directly to founders and stakeholders'] },
    { id: 'DES-118', cat: 'design', title: 'Brand Identity Designer', years: '5+', hours: 40, remote: 'UK / Europe Overlap',
      summary: 'Creates complete visual identities, from logo systems and typography to brand guidelines, packaging and campaign assets that stay consistent across every touchpoint.',
      skills: ['Adobe Illustrator', 'Brand Guidelines', 'Logo Systems', 'Packaging'],
      highlights: ['Delivered full brand books for early-stage and growing companies', 'Strong typography and layout fundamentals', 'Prepares print-ready and digital-ready files'] },
    { id: 'DES-231', cat: 'design', title: 'Motion & Visual Designer', years: '4+', hours: 30, remote: 'US / Europe Overlap',
      summary: 'Brings products and brands to life with motion: product explainers, UI micro-interactions, social content and animated brand assets.',
      skills: ['After Effects', 'Lottie', 'Figma', 'Cinema 4D'],
      highlights: ['Produces lightweight Lottie animations ready for web and apps', 'Experience with launch videos and social campaigns', 'Works closely with UI designers and developers'] },
    { id: 'ENG-412', cat: 'engineering', title: 'Senior Full-Stack Engineer', years: '6+', hours: 40, remote: 'US / UK Overlap',
      summary: 'Specialized in web application development, clean API architecture, database performance, and scalable cloud deployments.',
      skills: ['React / Next.js', 'Node.js', 'TypeScript', 'PostgreSQL'],
      highlights: ['Shipped production apps from first commit to launch', 'Writes clear, tested and well-documented code', 'Comfortable owning features across frontend and backend'] },
    { id: 'DAT-308', cat: 'data', title: 'Data & BI Analytics Specialist', years: '5+', hours: 40, remote: 'US / Europe Overlap',
      summary: 'Hands-on focus in centralized reporting, analytics transformations, warehouse pipelines, and executive dashboards that teams actually use.',
      skills: ['Python', 'SQL', 'Databricks', 'Tableau'],
      highlights: ['Turned scattered spreadsheets into a single source of truth', 'Builds executive dashboards with clear, trusted metrics', 'Translates business questions into analysis'] },
    { id: 'DAT-322', cat: 'data', title: 'Data Engineer', years: '6+', hours: 40, remote: 'US EST Overlap',
      summary: 'Designs and maintains reliable data pipelines and modern warehouse setups, so analysts and stakeholders always work with fresh, accurate data.',
      skills: ['Airflow', 'dbt', 'Snowflake', 'Spark'],
      highlights: ['Built batch and streaming pipelines at scale', 'Strong focus on data quality, testing and monitoring', 'Experience with cloud warehouses and cost optimization'] },
    { id: 'DAT-215', cat: 'data', title: 'Data Scientist', years: '4+', hours: 40, remote: 'UK / Europe Overlap',
      summary: 'Applies statistics and machine learning to real business problems: forecasting, segmentation, experimentation and predictive modelling.',
      skills: ['Python', 'scikit-learn', 'Forecasting', 'A/B Testing'],
      highlights: ['Built forecasting models used for planning and inventory', 'Designs and analyses product experiments', 'Explains complex results in plain language'] },
    { id: 'DAT-140', cat: 'data', title: 'Power BI Developer', years: '5+', hours: 30, remote: 'Middle East / Europe Overlap',
      summary: 'Builds fast, well-modelled Power BI reports with clean data models, solid DAX and automated refreshes connected to your existing systems.',
      skills: ['Power BI', 'DAX', 'Power Query', 'Azure'],
      highlights: ['Designed semantic models for finance and operations teams', 'Automated manual reporting into scheduled dashboards', 'Experience with row-level security and workspace setup'] },
    { id: 'GRO-109', cat: 'growth', title: 'Growth Marketing Lead', years: '6+', hours: 40, remote: 'US / UK Overlap',
      summary: 'Runs data-driven acquisition and lifecycle campaigns across paid, email and content, with a sharp eye on funnel metrics and CAC.',
      skills: ['Meta Ads', 'Google Ads', 'HubSpot', 'Funnel Analytics'],
      highlights: ['Planned and scaled paid acquisition across channels', 'Built lifecycle and email automation flows', 'Reports clearly on spend, conversion and ROI'] },
    { id: 'GRO-127', cat: 'growth', title: 'Product Manager', years: '5+', hours: 40, remote: 'US / Europe Overlap',
      summary: 'Bridges users, design and engineering: shapes roadmaps, writes clear specs and keeps delivery focused on outcomes.',
      skills: ['Roadmapping', 'Jira', 'Amplitude', 'User Research'],
      highlights: ['Led discovery and delivery for B2B SaaS features', 'Writes clear PRDs and user stories', 'Comfortable working with distributed teams'] }
  ];

  const ICONS = {
    design: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 100 18c1.1 0 1.7-.8 1.7-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7h2A4.6 4.6 0 0021 10.6C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="7.3" r="1.2" fill="currentColor"/><circle cx="14.5" cy="7.3" r="1.2" fill="currentColor"/></svg>',
    engineering: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15"/></svg>',
    data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5z"/></svg>',
    growth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>'
  };
  const SHIELD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4" stroke-linecap="round"/></svg>';
  const GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 3.7 5.4 3.7 9s-1.2 6.6-3.7 9c-2.5-2.4-3.7-5.4-3.7-9S9.5 5.4 12 3z"/></svg>';
  const DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6" stroke-linecap="round"/></svg>';
  const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3" stroke-linecap="round"/></svg>';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const grid = document.getElementById('rmGrid');
  const empty = document.getElementById('rmEmpty');
  const count = document.getElementById('rmCount');
  const search = document.getElementById('rmSearch');
  const pills = modal.querySelectorAll('[data-rm-filter]');
  const dossier = document.getElementById('rmDossier');
  const dContent = document.getElementById('rdContent');
  let filter = 'all', lastFocus = null;

  const idBlock = c => `
    <div class="rc-id">
      <div class="rc-icon">${ICONS[c.cat]}</div>
      <div>
        <p class="rc-bench">${SHIELD}Confidential Bench</p>
        <p class="rc-code">Candidate #${esc(c.id)}</p>
      </div>
    </div>`;

  const card = (c, k) => `
    <article class="rc" data-cat="${c.cat}" style="--k:${k}">
      <div class="rc-top">${idBlock(c)}<span class="rc-hours">${c.hours} hrs/week</span></div>
      <div class="rc-info">
        <div class="rc-title-row"><h3 class="rc-title">${esc(c.title)}</h3><span class="rc-exp">${esc(c.years)} Years Exp</span></div>
        <p class="rc-remote">${GLOBE}Remote (${esc(c.remote)})</p>
        <p class="rc-desc">${esc(c.summary)}</p>
        <div class="rc-skills">${c.skills.map(s => `<span>${esc(s)}</span>`).join('')}</div>
        <div class="rc-actions">
          <button type="button" class="rc-btn ghost" data-dossier="${esc(c.id)}">${DOC}Preview Dossier</button>
          <a href="#book" class="rc-btn solid" data-rm-book>${LOCK}Request Intro</a>
        </div>
      </div>
    </article>`;

  const render = () => {
    const q = search.value.trim().toLowerCase();
    const list = CANDIDATES.filter(c =>
      (filter === 'all' || c.cat === filter) &&
      (!q || [c.title, c.id, c.remote, c.summary, ...c.skills].join(' ').toLowerCase().includes(q)));
    grid.innerHTML = list.map(card).join('');
    empty.hidden = list.length > 0;
    count.textContent = list.length ? `${list.length} ${list.length === 1 ? 'professional' : 'professionals'} available` : '';
  };

  const openDossier = (id) => {
    const c = CANDIDATES.find(x => x.id === id);
    if (!c) return;
    dContent.innerHTML = `
      <div class="rd-head rc-top" data-cat="${c.cat}">${idBlock(c)}<h3 class="rd-title" id="rdTitle">${esc(c.title)}</h3></div>
      <dl class="rd-facts">
        <div><dt>Experience</dt><dd>${esc(c.years)} years</dd></div>
        <div><dt>Availability</dt><dd>${c.hours} hrs/week</dd></div>
        <div><dt>Timezone</dt><dd>${esc(c.remote)}</dd></div>
      </dl>
      <div class="rd-section"><h4>Summary</h4><p>${esc(c.summary)}</p></div>
      <div class="rd-section"><h4>Highlights</h4><ul>${c.highlights.map(h => `<li>${esc(h)}</li>`).join('')}</ul></div>
      <div class="rd-section"><h4>Core skills</h4><div class="rd-skills">${c.skills.map(s => `<span>${esc(s)}</span>`).join('')}</div></div>
      <p class="rd-note">Name, CV and work samples are shared once you request an intro.</p>
      <a href="#book" class="rc-btn solid rd-cta" data-rm-book>${LOCK}Request Intro to #${esc(c.id)}</a>`;
    dossier.classList.add('is-open');
    dossier.setAttribute('aria-hidden', 'false');
    dossier.scrollTop = 0;
    document.getElementById('rdBack').focus();
  };
  const closeDossier = () => {
    if (!dossier.classList.contains('is-open')) return false;
    dossier.classList.remove('is-open');
    dossier.setAttribute('aria-hidden', 'true');
    return true;
  };

  const open = (e) => {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    render();
    modal.hidden = false;
    document.body.classList.add('rm-open');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
    setTimeout(() => modal.querySelector('.rm-close').focus(), 50);
  };
  const close = () => {
    closeDossier();
    modal.classList.remove('is-open');
    document.body.classList.remove('rm-open');
    setTimeout(() => { modal.hidden = true; if (lastFocus) lastFocus.focus(); }, 380);
  };

  document.querySelectorAll('.view-more, [data-open-roster]').forEach(b => b.addEventListener('click', open));
  modal.querySelectorAll('[data-rm-close]').forEach(b => b.addEventListener('click', close));
  document.getElementById('rdBack').addEventListener('click', closeDossier);
  pills.forEach(p => p.addEventListener('click', () => {
    filter = p.dataset.rmFilter;
    pills.forEach(x => x.setAttribute('aria-selected', x === p));
    render();
  }));
  search.addEventListener('input', render);
  modal.addEventListener('click', (e) => {
    const d = e.target.closest('[data-dossier]');
    if (d) { openDossier(d.dataset.dossier); return; }
    const book = e.target.closest('[data-rm-book]');
    if (book) { e.preventDefault(); close(); setTimeout(() => document.getElementById('book').scrollIntoView({ behavior: 'smooth' }), 400); }
  });
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') { if (!closeDossier()) close(); }
    if (e.key === 'Tab') {
      const scope = dossier.classList.contains('is-open') ? dossier : modal.querySelector('.rm-panel');
      const f = [...scope.querySelectorAll('button, a[href], input')].filter(el => el.offsetParent !== null && !el.closest('[aria-hidden="true"]'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();

// ---------- Apply as Talent popup ----------
(() => {
  const modal = document.getElementById('applyModal');
  if (!modal) return;
  // Where applications are sent. Paste your Formspree (or similar) form link here, e.g. 'https://formspree.io/f/abcdwxyz'.
  // While it stays empty, the form only shows the "received" screen and nothing is sent anywhere.
  const FORM_ENDPOINT = '';

  const ROLES = {
    Design: ['Brand Identity Designer', 'UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Motion Designer', 'Web Designer', 'Illustrator', 'Packaging Designer', 'Presentation Designer', 'Design System Specialist'],
    Data: ['Data Analyst', 'Data Engineer', 'Data Scientist', 'Machine Learning Engineer', 'Business Intelligence Analyst', 'Power BI Developer', 'Tableau Developer', 'Analytics Engineer', 'Data Visualization Specialist']
  };
  const form = document.getElementById('apForm');
  const steps = [...modal.querySelectorAll('[data-step]')];
  const dots = [...modal.querySelectorAll('[data-step-dot]')];
  const roleSel = document.getElementById('apRole');
  const cv = document.getElementById('apCv'), cvLabel = document.getElementById('apCvLabel');
  let current = 1, lastFocus = null;

  const go = (n) => {
    current = n;
    steps.forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
    dots.forEach(d => {
      const k = +d.dataset.stepDot;
      d.classList.toggle('is-active', k === n);
      d.classList.toggle('is-done', k < n);
    });
    modal.querySelector('.ap-main').scrollTop = 0;
    modal.querySelector('.ap-panel').scrollTop = 0;
    const first = steps.find(s => +s.dataset.step === n).querySelector('input, select, button');
    const panel = modal.querySelector('.ap-panel');
    if (first) setTimeout(() => { first.focus({ preventScroll: true }); panel.scrollTop = 0; modal.querySelector('.ap-main').scrollTop = 0; }, 60);
  };

  const clearErr = (field) => { field.classList.remove('has-error'); const e = field.querySelector('.ap-err'); if (e) e.remove(); };
  const setErr = (field, msg) => {
    if (field.querySelector('.ap-err')) return;
    field.classList.add('has-error');
    const e = document.createElement('span'); e.className = 'ap-err'; e.textContent = msg; field.appendChild(e);
  };
  const validate = (stepEl) => {
    let ok = true, firstBad = null;
    // accept links typed without https:// (e.g. www.linkedin.com/in/name)
    stepEl.querySelectorAll('input[type="url"]').forEach(inp => {
      const v = inp.value.trim();
      if (v && !/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) inp.value = 'https://' + v;
    });
    stepEl.querySelectorAll('.ap-field').forEach(clearErr);
    const checked = new Set();
    stepEl.querySelectorAll('input[required], select[required]').forEach(inp => {
      const field = inp.closest('.ap-field');
      if (inp.type === 'radio') {
        if (checked.has(inp.name)) return; checked.add(inp.name);
        if (!stepEl.querySelector(`input[name="${inp.name}"]:checked`)) { ok = false; setErr(field, 'Please choose one option.'); firstBad = firstBad || inp; }
        return;
      }
      if (!inp.value.trim()) { ok = false; setErr(field, 'This field is required.'); firstBad = firstBad || inp; }
      else if (!inp.checkValidity()) { ok = false; setErr(field, inp.type === 'email' ? 'Please enter a valid email.' : inp.type === 'url' ? 'Please enter a valid link, e.g. behance.net/yourname' : 'Please check this field.'); firstBad = firstBad || inp; }
    });
    stepEl.querySelectorAll('input[type="url"]:not([required])').forEach(inp => {
      if (inp.value.trim() && !inp.checkValidity()) { ok = false; setErr(inp.closest('.ap-field'), 'Please enter a valid link, e.g. behance.net/yourname'); firstBad = firstBad || inp; }
    });
    // summary right above the buttons, so it's visible even if the bad field is off screen
    let sum = stepEl.querySelector('.ap-summary');
    if (!ok) {
      const names = [...stepEl.querySelectorAll('.ap-field.has-error')].map(f => (f.querySelector(':scope > span') || {}).textContent || '').map(t => t.replace(/\(optional\)/, '').trim()).filter(Boolean);
      if (!sum) { sum = document.createElement('p'); sum.className = 'ap-summary'; sum.setAttribute('role', 'alert'); stepEl.querySelector('.ap-actions').before(sum); }
      sum.textContent = 'Please complete: ' + names.join(', ') + '.';
    } else if (sum) { sum.remove(); }
    if (firstBad) { firstBad.focus({ preventScroll: true }); setTimeout(() => firstBad.closest('.ap-field').scrollIntoView({ behavior: 'smooth', block: 'center' }), 1200); }
    return ok;
  };

  form.addEventListener('input', (e) => { const f = e.target.closest('.ap-field'); if (f) clearErr(f); });
  form.querySelectorAll('input[name="discipline"]').forEach(r => r.addEventListener('change', () => {
    roleSel.innerHTML = '<option value="">Select your role</option>' + ROLES[r.value].map(x => `<option>${x}</option>`).join('');
  }));
  cv.addEventListener('change', () => {
    const f = cv.files[0];
    cvLabel.innerHTML = f ? `<b>${f.name.replace(/[<>&]/g, '')}</b> ${(f.size / 1024 / 1024).toFixed(1)} MB, click to change` : '<b>Upload your CV</b> PDF or Word, optional';
  });
  modal.querySelector('[data-next]').addEventListener('click', () => { if (validate(steps[0])) go(2); });
  modal.querySelector('[data-back]').addEventListener('click', () => go(1));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(steps[1])) return;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending...';
    const name = (form.elements.name.value.trim().split(' ')[0] || '').replace(/[<>&]/g, '');
    let sent = true;
    if (FORM_ENDPOINT) {
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        sent = res.ok;
      } catch (err) { sent = false; }
    }
    btn.disabled = false; btn.textContent = 'Submit application';
    if (!sent) { alert('Sorry, something went wrong. Please try again, or email hello@staffle.net.'); return; }
    document.getElementById('apDoneText').textContent = `Thanks${name ? ', ' + name : ''}! Our team reviews every application. If your profile fits an open role, we'll reach out for a short technical assessment.`;
    go(3);
  });

  const open = (e) => {
    if (e) e.preventDefault();
    if (typeof menu !== 'undefined' && menu) { menu.classList.remove('open'); }
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('ap-open');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('is-open')));
    go(current === 3 ? 1 : current);
  };
  const close = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('ap-open');
    setTimeout(() => {
      modal.hidden = true;
      if (current === 3) { form.reset(); roleSel.innerHTML = '<option value="">Choose a discipline first</option>'; cvLabel.innerHTML = '<b>Upload your CV</b> PDF or Word, optional'; current = 1; }
      if (lastFocus) lastFocus.focus();
    }, 380);
  };

  document.querySelectorAll('a[href="apply.html"], [data-open-apply]').forEach(a => a.addEventListener('click', open));
  modal.querySelectorAll('[data-ap-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const f = [...modal.querySelectorAll('button, a[href], input, select')].filter(el => el.offsetParent !== null && !el.closest('.ap-step:not(.is-active)') && !(el.type === 'radio' && !el.checked && modal.querySelector(`input[name="${el.name}"]:checked`)));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();