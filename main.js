/* ================================================================
   JAMES OMEIZA BAYODE — main.js v2
   Nav · Reveal · Skill bars · Seismic canvas
   ================================================================ */

// ─── Navigation ──────────────────────────────────────────────
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

if (toggle) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(5px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    links.classList.remove('open');
    if (toggle) {
      toggle.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    }
  });
});

// Active page highlight
(function () {
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const h = a.getAttribute('href').split('/').pop();
    a.classList.toggle('active', h === cur);
  });
})();

// ─── Scroll Reveal ───────────────────────────────────────────
new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
.observe = (() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  return obs.observe.bind(obs);
})();

// ─── Skill Bars ──────────────────────────────────────────────
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.skill-fill').forEach(bar => bar.classList.add('animate'));
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.skill-col, .skills-section').forEach(el => skillObs.observe(el));

// ─── Seismic Wave Canvas ──────────────────────────────────────
function seismic(id, opts = {}) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = () => canvas.width;
  const H = () => canvas.height;

  const resize = () => {
    canvas.width  = canvas.offsetWidth  || canvas.parentElement?.offsetWidth  || 400;
    canvas.height = canvas.offsetHeight || canvas.parentElement?.offsetHeight || 120;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const N = opts.traces || 6;
  const dark = opts.dark !== false;
  const animated = opts.animated !== false;
  let t = 0;

  const palette = dark
    ? ['rgba(13,184,130,0.7)', 'rgba(20,220,160,0.5)', 'rgba(13,184,130,0.4)',
       'rgba(13,184,130,0.6)', 'rgba(20,184,130,0.3)', 'rgba(13,184,130,0.8)']
    : ['rgba(13,92,74,0.35)', 'rgba(20,120,100,0.25)', 'rgba(13,92,74,0.2)',
       'rgba(13,92,74,0.3)', 'rgba(20,100,80,0.15)', 'rgba(13,92,74,0.4)'];

  function noise(x, s, f1, f2, f3) {
    return Math.sin(x * f1 + s) * 0.5
         + Math.sin(x * f2 + s * 1.8) * 0.3
         + Math.sin(x * f3 + s * 0.9) * 0.2
         + Math.sin(x * f1 * 3 + s * 2.2) * 0.08;
  }

  function frame() {
    ctx.clearRect(0, 0, W(), H());
    for (let i = 0; i < N; i++) {
      const yBase = (H() / (N + 1)) * (i + 1);
      const amp = 14 + i * 3.5;
      const s = i * 2.1;
      const speed = animated ? (0.25 + i * 0.04) : 0;

      ctx.beginPath();
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= W(); x += 2) {
        const prog = (x + t * speed * 30) / W();
        const burst1 = Math.exp(-Math.pow((x / W() - (0.22 + i * 0.1)) * 9, 2)) * 0.9;
        const burst2 = Math.exp(-Math.pow((x / W() - (0.7  + i * 0.04)) * 11, 2)) * 0.6;
        const n = noise(prog * 45, s, 0.022 + i * 0.003, 0.058 + i * 0.002, 0.13 + i * 0.002);
        ctx.lineTo(x, yBase + n * amp * (1 + burst1 + burst2));
      }
      ctx.strokeStyle = palette[i % palette.length];
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (animated) {
      t += 0.5;
      requestAnimationFrame(frame);
    }
  }
  frame();
}

// Hero canvas
seismic('hero-seismic', { dark: false, traces: 7, animated: true });

// Mini canvases for project cards (static, dark)
document.querySelectorAll('[data-seismic]').forEach((c, i) => {
  c.width  = c.offsetWidth  || 360;
  c.height = c.offsetHeight || 100;
  c.id = c.id || `sc-${i}`;
  seismic(c.id, { dark: true, traces: 5, animated: false });
  // Stamp a unique look by running with different offset
});

// ─── Contact form ────────────────────────────────────────────
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const txt = btn.textContent;
    btn.textContent = 'Message sent ✓';
    btn.disabled = true;
    setTimeout(() => { btn.textContent = txt; btn.disabled = false; form.reset(); }, 3500);
  });
}

// ─── Smooth anchor scroll ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});
