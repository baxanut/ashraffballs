/* ─────────────────────────────────────
   CURSOR
───────────────────────────────────── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

(function cursorLoop() {
  rx += (mx - rx) * 0.13;
  ry += (my - ry) * 0.13;
  dot.style.left  = mx + 'px';
  dot.style.top   = my + 'px';
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(cursorLoop);
})();

document.querySelectorAll('a, button, .nav-pill, .dot, .feature-card, .team-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
});

/* ─────────────────────────────────────
   SCENES + NAV PILLS
───────────────────────────────────── */
const main   = document.getElementById('main');
const scenes = Array.from(document.querySelectorAll('.scene[data-label]'));
const pillsWrap = document.getElementById('nav-pills');
const progress  = document.getElementById('progress');

scenes.forEach((s, i) => {
  const pill = document.createElement('div');
  pill.className = 'nav-pill' + (i === 0 ? ' on' : '');
  pill.title = s.dataset.label;
  pill.addEventListener('click', () => scrollToScene(i));
  pillsWrap.appendChild(pill);
});

function scrollToScene(i) {
  scenes[i].scrollIntoView({ behavior: 'smooth' });
}

/* ─────────────────────────────────────
   SCROLL SNAP OBSERVER
   Fires when a scene snaps into view — triggers staggered element animations
───────────────────────────────────── */
let activeIdx = 0;
const countersRun = new Set();

const snapObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const idx = scenes.indexOf(entry.target);
    activeIdx = idx;

    // Update nav pills
    document.querySelectorAll('.nav-pill').forEach((p, i) => p.classList.toggle('on', i === idx));

    // Update progress
    progress.style.width = (idx / (scenes.length - 1) * 100) + '%';

    // Trigger staggered element animations in this scene
    animateScene(entry.target);

    // Counters
    if (idx === 5) runCounters();
    if (idx === 1) runStatCounter();
  });
}, { threshold: 0.55 });

scenes.forEach(s => snapObserver.observe(s));

/* ─────────────────────────────────────
   STAGGERED SCENE ANIMATION
───────────────────────────────────── */
function animateScene(scene) {
  const els = scene.querySelectorAll('.animate');
  els.forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('in'), delay);
  });
}

// Animate first scene immediately on load
window.addEventListener('load', () => {
  setTimeout(() => animateScene(scenes[0]), 200);
});

/* ─────────────────────────────────────
   COUNTERS
───────────────────────────────────── */
function runCounters() {
  document.querySelectorAll('.counter[data-target]').forEach(el => {
    if (countersRun.has(el)) return;
    countersRun.add(el);
    const target = +el.dataset.target;
    const dur = target === 0 ? 300 : 1800;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(e * target);
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  });
}

function runStatCounter() {
  const el = document.querySelector('.stat-number[data-target]');
  if (!el || countersRun.has(el)) return;
  countersRun.add(el);
  const target = +el.dataset.target;
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / 1800, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(e * target);
    if (p < 1) requestAnimationFrame(step);
  })(performance.now());
}

/* ─────────────────────────────────────
   HERO PARTICLE CANVAS
───────────────────────────────────── */
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 6;
      this.r  = Math.random() * 1.4 + .25;
      this.vx = (Math.random() - .5) * .17;
      this.vy = -Math.random() * .26 - .04;
      this.a  = Math.random() * .32 + .04;
      this.hue = Math.random() > .55 ? '167,139,250' : '124,58,237';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.y < -6 || this.x < -6 || this.x > W + 6) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.hue},${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 110; i++) pts.push(new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 88) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(167,139,250,${(1 - d / 88) * .055})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
    pts.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();

/* ─────────────────────────────────────
   AMBIENT ORB CANVASES (insight + traction)
───────────────────────────────────── */
['insight-canvas', 'traction-canvas'].forEach(id => {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, t = 0;

  const orbs = [
    { x: .15, y: .35, r: .42, c: '124,58,237',  s: .0003  },
    { x: .85, y: .65, r: .38, c: '167,139,250', s: -.0004 },
    { x: .5,  y: .5,  r: .55, c: '109,40,217',  s: .00022 },
  ];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    t += .005;
    orbs.forEach(o => {
      const ox = (o.x + Math.sin(t * o.s * 1000 + o.x) * .07) * W;
      const oy = (o.y + Math.cos(t * o.s * 1000 + o.y) * .07) * H;
      const gr = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r * Math.min(W, H));
      gr.addColorStop(0, `rgba(${o.c},.075)`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
    });
    requestAnimationFrame(loop);
  })();
});

/* ─────────────────────────────────────
   CTA RIPPLE CANVAS
───────────────────────────────────── */
(function initCTA() {
  const canvas = document.getElementById('cta-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, rings = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function spawn() { rings.push({ r: 0, a: .28 }); }
  setInterval(spawn, 2200);
  spawn();

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    rings = rings.filter(r => r.a > 0);
    rings.forEach(r => {
      r.r += .85; r.a -= .0018;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(167,139,250,${r.a})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
    requestAnimationFrame(loop);
  })();
})();

/* ─────────────────────────────────────
   KEYBOARD NAVIGATION (presenter mode)
───────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (['ArrowDown', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
    scrollToScene(Math.min(activeIdx + 1, scenes.length - 1));
  }
  if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
    e.preventDefault();
    scrollToScene(Math.max(activeIdx - 1, 0));
  }
});

/* ─────────────────────────────────────
   VIDEO PLACEHOLDER HIDE
───────────────────────────────────── */
document.querySelectorAll('video').forEach(v => {
  v.addEventListener('loadeddata', () => {
    const ph = v.nextElementSibling;
    if (ph?.classList.contains('media-placeholder')) ph.style.display = 'none';
  });
});
