const FRACS = [0, 1 / 3, 2 / 3, 1], NS = 'http://www.w3.org/2000/svg', { max, min, floor, ceil, round, random, sin } = Math;

export function createCourseController(layer, sections) {
  const $ = (id) => document.getElementById(id);
  const track = $('course-track'), prog = $('course-progress'), dot = $('course-dot');
  const halo = $('course-dot-halo'), num = $('course-num'), flags = $('course-flags'), canvas = $('course-wind');
  if (!track || !prog || !dot || !halo || !num || !flags) return { update() {}, setInteractive() {} };

  const len = track.getTotalLength();
  prog.style.strokeDasharray = prog.style.strokeDashoffset = `${len}`;
  const el = (tag, a) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); return n; };

  const flagNodes = sections.map((sec, i) => {
    const p = track.getPointAtLength(len * FRACS[i]), x = p.x.toFixed(1), y = p.y.toFixed(1), dir = i % 2 ? 1 : -1;
    const g = el('g', { class: 'course-flag' });
    const lbl = el('text', { class: 'course-flag-label', x: (p.x + dir * 20).toFixed(1), y: (p.y + 4.3).toFixed(1), 'text-anchor': dir > 0 ? 'start' : 'end' });
    lbl.textContent = `${String(i + 1).padStart(2, '0')} ${sec.title.toUpperCase()}`;
    g.append(el('line', { class: 'course-flag-stem', x1: x, y1: y, x2: (p.x + dir * 14).toFixed(1), y2: y }), el('circle', { class: 'course-flag-node', cx: x, cy: y, r: '4.5' }), lbl);
    flags.append(g); return g;
  });

  let ctx = null, lines = [], w = 0, h = 0, raf = 0, active = false, ink = 'rgba(242,239,233,0.07)', rt = 0, last = -1;
  const readInk = () => { ink = getComputedStyle(document.documentElement).getPropertyValue('--wind-ink').trim() || ink; };
  const resize = () => {
    if (!canvas || !ctx) return;
    const r = layer.getBoundingClientRect(), dpr = min(devicePixelRatio || 1, 2);
    w = max(1, r.width); h = max(1, r.height);
    canvas.width = floor(w * dpr); canvas.height = floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); readInk();
    if (!lines.length) for (let i = 0; i < 36; i++) lines.push({ x: random() * w, y: random() * h, l: 28 + random() * 52, v: 0.22 + random() * 0.34, p: random() * 6.28 });
  };
  const draw = (now) => {
    if (!active || !ctx) return;
    const t = now * 5e-4;
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = ink; ctx.lineWidth = 1;
    for (const s of lines) {
      s.x += s.v;
      if (s.x - s.l > w + 10) { s.x = -s.l; s.y = random() * h; }
      ctx.beginPath(); ctx.moveTo(s.x - s.l, s.y);
      ctx.quadraticCurveTo(s.x - s.l * 0.5, s.y + sin(t + s.p) * 4, s.x, s.y);
      ctx.stroke();
    }
    raf = requestAnimationFrame(draw);
  };
  const setWind = (on) => {
    if (!canvas) return;
    if (!ctx && on) { ctx = canvas.getContext('2d', { alpha: true }); resize(); }
    if (!ctx) return;
    if (on && !active && !document.hidden) { active = true; resize(); raf = requestAnimationFrame(draw); }
    else if ((!on || document.hidden) && active) { active = false; cancelAnimationFrame(raf); raf = 0; }
  };

  document.addEventListener('visibilitychange', () => document.hidden && setWind(false));
  addEventListener('themechange', readInk);
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 180); });

  return {
    update(pos, mix, rm) {
      const p = max(0, min(sections.length - 1, pos)), lo = floor(p), hi = min(FRACS.length - 1, ceil(p));
      const d = max(0, min(len, len * (FRACS[lo] + (FRACS[hi] - FRACS[lo]) * (p - lo)))), pt = track.getPointAtLength(d);
      prog.style.strokeDashoffset = `${(len - d).toFixed(2)}`;
      const px = pt.x.toFixed(1), py = pt.y.toFixed(1);
      dot.setAttribute('cx', px); dot.setAttribute('cy', py); halo.setAttribute('cx', px); halo.setAttribute('cy', py);
      flagNodes.forEach((g, idx) => g.classList.toggle('is-passed', idx <= p + 0.02));
      const n = round(p);
      if (n !== last) { last = n; num.textContent = String(n + 1).padStart(2, '0'); flagNodes.forEach((g, idx) => g.classList.toggle('is-current', idx === n)); }
      setWind(!rm && mix > 0.08);
    },
    setInteractive(isList) { layer.inert = !isList; layer.setAttribute('aria-hidden', String(!isList)); },
  };
}
