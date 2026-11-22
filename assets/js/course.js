const FRACS = [0.04, 0.36, 0.68, 0.96], NS = 'http://www.w3.org/2000/svg';

export function createCourseController(layer, sections) {
  const $ = (id) => document.getElementById(id);
  const track = $('course-track'), prog = $('course-progress'), dot = $('course-dot');
  const halo = $('course-dot-halo'), num = $('course-num'), flags = $('course-flags'), canvas = $('course-wind');
  if (!track || !prog || !dot || !halo || !num || !flags) return { update() {}, setInteractive() {} };

  const len = track.getTotalLength();
  prog.style.strokeDasharray = prog.style.strokeDashoffset = `${len}`;

  const el = (tag, a) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(a)) n.setAttribute(k, v);
    return n;
  };

  const flagNodes = sections.map((sec, i) => {
    const p = track.getPointAtLength(len * FRACS[i]), x = p.x.toFixed(1), y = p.y.toFixed(1);
    const g = el('g', { class: 'course-flag' });
    const lbl = el('text', { class: 'course-flag-label', x: (p.x + 22).toFixed(1), y: (p.y + 4.2).toFixed(1), 'text-anchor': 'start' });
    lbl.textContent = `${String(i + 1).padStart(2, '0')} ${sec.title.toUpperCase()}`;
    g.append(el('line', { class: 'course-flag-stem', x1: x, y1: y, x2: (p.x + 16).toFixed(1), y2: y }), el('circle', { class: 'course-flag-node', cx: x, cy: y, r: '4.5' }), lbl);
    flags.append(g);
    return g;
  });

  let ctx = null, lines = [], w = 0, h = 0, raf = 0, active = false, ink = 'rgba(242,239,233,0.07)';
  const readInk = () => { ink = getComputedStyle(document.documentElement).getPropertyValue('--wind-ink').trim() || ink; };
  const resize = () => {
    if (!canvas || !ctx) return;
    const r = layer.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readInk();
    if (!lines.length) for (let i = 0; i < 36; i++) lines.push({ x: Math.random() * w, y: Math.random() * h, l: 28 + Math.random() * 52, v: 0.22 + Math.random() * 0.34, p: Math.random() * 6.28 });
  };
  const draw = (now) => {
    if (!active || !ctx) return;
    const t = now * 5e-4;
    ctx.clearRect(0, 0, w, h); ctx.strokeStyle = ink; ctx.lineWidth = 1;
    for (const s of lines) {
      s.x += s.v;
      if (s.x - s.l > w + 10) { s.x = -s.l; s.y = Math.random() * h; }
      ctx.beginPath(); ctx.moveTo(s.x - s.l, s.y);
      ctx.quadraticCurveTo(s.x - s.l * 0.5, s.y + Math.sin(t + s.p) * 4, s.x, s.y);
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
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 180); });

  let last = -1;
  return {
    update(pos, mix, rm) {
      const f = FRACS[0] + (pos / Math.max(1, sections.length - 1)) * (FRACS[3] - FRACS[0]);
      const d = Math.max(0, Math.min(len, len * f)), pt = track.getPointAtLength(d);
      prog.style.strokeDashoffset = `${(len - d).toFixed(2)}`;
      const px = pt.x.toFixed(1), py = pt.y.toFixed(1);
      dot.setAttribute('cx', px); dot.setAttribute('cy', py);
      halo.setAttribute('cx', px); halo.setAttribute('cy', py);
      const n = Math.max(0, Math.min(sections.length - 1, Math.round(pos)));
      if (n !== last) {
        last = n;
        num.textContent = String(n + 1).padStart(2, '0');
        flagNodes.forEach((g, idx) => g.classList.toggle('is-current', idx === n));
      }
      setWind(!rm && mix > 0.08);
    },
    setInteractive(isList) { layer.inert = !isList; layer.setAttribute('aria-hidden', String(!isList)); },
  };
}
