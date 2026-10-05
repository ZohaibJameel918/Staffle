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
    ['.cta-links a span', 70, 0],
    ['.legal span, .legal nav a', 40, 0]
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

// Arcs reveal (one-time)
const arcs = document.getElementById('arcs');
if ('IntersectionObserver' in window) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { arcs.classList.remove('pre'); obs.disconnect(); } });
  }, { threshold: 0.35 }).observe(arcs);
} else { arcs.classList.remove('pre'); }

// Cards drop in from the top (once)
const cardsEl = document.getElementById('cards');
const dropIn = () => { cardsEl.classList.remove('pre'); cardsEl.classList.add('in'); };
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { dropIn(); obs.disconnect(); } });
  }, { threshold: 0, rootMargin: '0px 0px -20% 0px' }).observe(cardsEl);
} else { dropIn(); }

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
  const W = 383, H = 540, G = 0.45, E = 0.25, MU = 0.35;
  // collision circles for each shape: [offsetX, offsetY, radius] relative to its center
  const hulls = [
    [[-40, 20, 20], [34, -30, 20], [8, 8, 40]],
    [[0, 0, 72]],
    [[-50, 15, 30], [50, 15, 30], [0, -5, 40], [-70, 30, 18], [70, 30, 18]],
    [[-17, -17, 28], [0, 0, 28], [17, 17, 28]],
    [[0, 0, 34], [-30, -58, 14], [66, 2, 14], [-38, 56, 14], [22, -30, 22], [16, 32, 22], [-30, 0, 24]],
    [[-70.8, -122.1, 48],[-53.1, -91.6, 48],[-35.4, -61.1, 48],[-17.7, -30.5, 48],[0.0, 0.0, 48],[17.7, 30.5, 48],[35.4, 61.1, 48],[53.1, 91.6, 48],[70.8, 122.1, 48]]
  ];
  const bodies = [...svg.querySelectorAll('.shape')].map((g, i) => {
    const cx = +g.dataset.cx, cy = +g.dataset.cy, circles = hulls[i];
    let m = 0, I = 0;
    const dens = i === 5 ? 0.45 : 1;
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
          if (px - c.r < 0) resolve(A, null, { x: c.rx - c.r, y: c.ry }, null, 1, 0, c.r - px);
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
      const mdx = Math.max(-30, Math.min(30, p.x - last.x)), mdy = Math.max(-30, Math.min(30, p.y - last.y));
      bodies.forEach(b => {
        const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1;
        if (d > 130) return;
        const f = 1 - d / 130;
        b.vx += (dx / d * 1.2 + mdx * 0.35) * f;
        b.vy += (dy / d * 1.2 + mdy * 0.35) * f;
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