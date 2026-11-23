const NS = 'http://www.w3.org/2000/svg', { max, min, floor, round, random: R, sin, cos, abs } = Math;

export function createCourseController(layer, sections) {
  const D = document, $ = (id) => D.getElementById('course-' + id), N = max(1, sections.length - 1), AF = requestAnimationFrame;
  const tr = $('track'), pr = $('progress'), dot = $('dot'), halo = $('dot-halo'), num = $('num'), fl = $('flags'), cv = $('wind');
  if (!tr || !pr || !dot || !halo || !num || !fl) return { update() {}, setInteractive() {} };

  const len = tr.getTotalLength();
  pr.style.strokeDasharray = pr.style.strokeDashoffset = `${len}`;
  const setA = (n, a) => { for (const [k, v] of Object.entries(a)) n.setAttribute(k, v); return n; };
  const el = (t, a) => setA(D.createElementNS(NS, t), a);

  const fx = (v) => v.toFixed(1), nodes = sections.map((sec, i) => {
    const p = tr.getPointAtLength(len * i / N), x = fx(p.x), y = fx(p.y), d = i % 2 ? 1 : -1, F = 'course-flag';
    const g = el('g', { class: F }), lb = el('text', { class: F + '-label', x: fx(p.x + d * 20), y: fx(p.y + 4.3), 'text-anchor': d > 0 ? 'start' : 'end' });
    lb.textContent = `${String(i + 1).padStart(2, '0')} ${sec.title.toUpperCase()}`;
    g.append(el('line', { class: F + '-stem', x1: x, y1: y, x2: fx(p.x + d * 14), y2: y }), el('circle', { class: F + '-node', cx: x, cy: y, r: '4.5' }), lb);
    fl.append(g); return g;
  });

  let c = null, ls = [], lv = [], w = 0, h = 0, raf = 0, on = false, pt0 = 0, nl = 0, rt = 0, last = -1;
  let ink = 'rgba(242,239,233,.08)', lInk = 'rgba(242,239,233,.26)';
  const read = () => {
    const cs = getComputedStyle(D.documentElement), g = (k, f) => cs.getPropertyValue(k).trim() || f;
    ink = g('--wind-ink', ink); lInk = g('--leaf-ink', lInk);
  };
  const mkL = () => ({ x: -10, y: h * (.1 + R() * .8), s: 3.1 + R() * 3.5, vx: 105 + R() * 105, vy: (R() - .45) * 28, gf: 1.5 + R() * 2.2, wf: 2.1 + R() * 2.8, wa: 18 + R() * 34, p: R() * 6.28, a: R() * 6.28, sp: (R() < .5 ? -1 : 1) * (1.8 + R() * 3.4), ff: 3.2 + R() * 3.5, op: .65 + R() * .35, t: 0 });
  const rsz = () => {
    if (!cv || !c) return;
    const r = layer.getBoundingClientRect(), dpr = min(devicePixelRatio || 1, 2);
    w = max(1, r.width); h = max(1, r.height); cv.width = floor(w * dpr); cv.height = floor(h * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0); read();
    if (!ls.length) for (let i = 0; i < 36; i++) ls.push({ x: R() * w, y: R() * h, l: 28 + R() * 52, v: .22 + R() * .34, p: R() * 6.28 });
  };
  const draw = (now) => {
    if (!on || !c) return;
    const dt = pt0 ? min(.05, (now - pt0) / 1e3) : .016, t = now * 5e-4; pt0 = now;
    c.clearRect(0, 0, w, h); c.strokeStyle = ink; c.lineWidth = 1;
    for (const s of ls) {
      s.x += s.v; if (s.x - s.l > w + 10) { s.x = -s.l; s.y = R() * h; }
      c.beginPath(); c.moveTo(s.x - s.l, s.y); c.quadraticCurveTo(s.x - s.l * .5, s.y + sin(t + s.p) * 4, s.x, s.y); c.stroke();
    }
    if (!nl) nl = now + 700 + R() * 1400;
    if (now >= nl) { if (lv.length < 2) lv.push(mkL()); nl = now + (lv.length < 2 && R() < .3 ? 350 + R() * 1e3 : 2200 + R() * 4e3); }
    c.fillStyle = lInk;
    for (let i = lv.length - 1; i >= 0; i--) {
      const f = lv[i], S = f.s; f.t += dt;
      f.x += f.vx * (.72 + .55 * sin(f.t * f.gf + f.p)) * dt;
      f.y += (f.vy + sin(f.t * f.wf + f.p) * f.wa + cos(f.t * f.ff) * 14) * dt;
      f.a += (f.sp + sin(f.t * f.wf) * 1.4) * dt;
      if (f.x > w + 14 || f.y < -18 || f.y > h + 18) { lv.splice(i, 1); continue; }
      c.save(); c.globalAlpha = max(0, min(1, (f.x + 10) / 28, (w + 10 - f.x) / 28)) * f.op;
      c.translate(f.x, f.y); c.rotate(f.a); c.scale(1, .28 + .72 * abs(cos(f.t * f.ff + f.p)));
      c.beginPath(); c.moveTo(-S, 0); c.quadraticCurveTo(0, -S * .62, S, 0); c.quadraticCurveTo(0, S * .62, -S, 0); c.fill(); c.restore();
    }
    raf = AF(draw);
  };
  const sw = (v) => {
    if (!cv) return;
    if (!c && v) { c = cv.getContext('2d', { alpha: true }); rsz(); }
    if (!c) return;
    if (v && !on && !D.hidden) { on = true; pt0 = 0; rsz(); raf = AF(draw); }
    else if ((!v || D.hidden) && on) { on = false; pt0 = 0; cancelAnimationFrame(raf); raf = 0; }
  };

  D.addEventListener('visibilitychange', () => D.hidden && sw(false));
  const ON = addEventListener; ON('themechange', read); ON('resize', () => { clearTimeout(rt); rt = setTimeout(rsz, 180); });

  return {
    update(pos, mix, rm) {
      const p = max(0, min(N, pos)), d = len * p / N, pt = tr.getPointAtLength(d);
      pr.style.strokeDashoffset = `${(len - d).toFixed(2)}`;
      const xy = { cx: fx(pt.x), cy: fx(pt.y) }; setA(dot, xy); setA(halo, xy);
      nodes.forEach((g, i) => g.classList.toggle('is-passed', i <= p + .02));
      const n = round(p);
      if (n !== last) { last = n; num.textContent = String(n + 1).padStart(2, '0'); nodes.forEach((g, i) => g.classList.toggle('is-current', i === n)); }
      sw(!rm && mix > .08);
    },
    setInteractive(v) { layer.inert = !v; layer.setAttribute('aria-hidden', String(!v)); },
  };
}
