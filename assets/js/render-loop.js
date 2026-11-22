const { abs, max, min, round, exp } = Math, $ = (id) => document.getElementById(id);

export function createRenderLoop({ store, shell, rightPanel: rp, stageCards, leftScroll, courseLayer, course, info, announce }) {
  const s = store.state, edgeL = $('edge-left'), edgeR = $('edge-right'), hint = $('state-hint'), wheel = $('meter-wheel');
  const cIdx = $('compact-idx'), cTxt = $('compact-text'), items = [], bars = [];
  let pw = 1, ph = 1, raf = 0, lastT = 0, lastIdx = -1, rt = 0;

  if (wheel) {
    const addBar = (v) => { const b = document.createElement('span'); b.className = 'meter-bar'; wheel.append(b); bars.push({ el: b, v }); };
    addBar(-0.72); addBar(-0.5); addBar(-0.28);
    s.sections.forEach((sec, i) => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'meter-item'; btn.tabIndex = -1; btn.textContent = sec.title;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        s.mode === 'hero' ? (i === s.activeIndex ? store.enterList() : store.openSection(i)) : (i === s.targetIndex ? store.openSection(i) : store.jumpList(i));
      });
      wheel.append(btn); items.push({ el: btn, v: i });
      if (i < s.sections.length - 1) { addBar(i + 0.28); addBar(i + 0.5); addBar(i + 0.72); }
    });
    const lastV = s.sections.length - 1;
    addBar(lastV + 0.28); addBar(lastV + 0.5); addBar(lastV + 0.72);
  }

  const cards = s.sections.map((sec, i) => {
    const a = document.createElement('a'), scrim = document.createElement('div'), img = sec.media.querySelector('img');
    a.className = 'card-item'; a.href = `#${sec.id}`; a.setAttribute('aria-label', `Open ${sec.title}`);
    if (img && sec.focus) img.style.objectPosition = sec.focus;
    scrim.className = 'card-scrim'; scrim.setAttribute('aria-hidden', 'true');
    a.append(sec.media, scrim); stageCards.append(a);
    a.addEventListener('click', (e) => { e.preventDefault(); s.mode === 'list' ? store.openSection(i) : store.enterList(); });
    return a;
  });

  const measure = () => { const r = rp.getBoundingClientRect(); pw = max(1, r.width); ph = max(1, r.height); };

  const updateLabels = (idx) => {
    if (idx === lastIdx) return;
    lastIdx = idx;
    const cur = s.sections[idx], num = String(idx + 1).padStart(2, '0');
    if (edgeL) edgeL.textContent = num;
    if (edgeR) edgeR.textContent = cur.category.toUpperCase();
    if (cIdx) cIdx.textContent = num;
    if (cTxt) cTxt.textContent = `${cur.category} — ${cur.title}`;
    if (s.mode === 'list') info.applyTone(cur);
  };

  const renderMeter = (pos, mix) => {
    const step = 62 - 14 * mix, base = 0.42 + 0.22 * mix;
    for (const it of items) {
      const dy = (it.v - pos) * step, fade = max(0, 1 - abs(dy) / 94), st = it.el.style;
      if (fade <= 0.01) { st.opacity = '0'; st.pointerEvents = 'none'; continue; }
      const f = max(0, 1 - abs(it.v - pos) / 0.58);
      st.transform = `translate3d(-50%,calc(-50% + ${dy.toFixed(2)}px),0) scale(${(0.78 + 0.27 * f).toFixed(3)})`;
      st.opacity = (fade * (base + (1 - base) * f)).toFixed(3);
      st.pointerEvents = fade > 0.2 ? 'auto' : 'none';
      it.el.classList.toggle('is-center', f > 0.5);
    }
    for (const b of bars) {
      const dy = (b.v - pos) * step, g = max(0, 1 - abs(dy) / 92), st = b.el.style;
      if (g <= 0.01) { st.opacity = '0'; continue; }
      st.width = `${(5 + 21 * g).toFixed(1)}px`;
      st.transform = `translate3d(-50%,calc(-50% + ${dy.toFixed(2)}px),0)`;
      st.opacity = (g * (0.68 + 0.28 * mix)).toFixed(3);
    }
  };

  const render = () => {
    const { position: pos, listMix: mix, mode, reducedMotion: rm, sections } = s, isList = mode === 'list';
    let cw = pw * 0.6, ch = cw * (4 / 3);
    if (ch > ph * 0.66) { ch = ph * 0.66; cw = ch * 0.75; }
    const ix = ((pw - cw) / 2 / pw) * 100 * mix, iy = ((ph - ch) / 2 / ph) * 100 * mix, rad = 14 * mix;
    const stride = ph * 1.05 + (ch * 0.72 + ph * 0.17 - ph * 1.05) * mix;

    cards.forEach((c, i) => {
      const d = i - pos, ad = abs(d), sc = 1 - min(1, ad) * 0.56 * mix, st = c.style;
      const op = mix < 0.05 ? max(0, 1 - ad) : ad > 1.05 ? max(0, 1 - (ad - 1.05) * 1.4) : 1 - ad * 0.14 * mix;
      st.transform = `translate3d(0,${(d * stride).toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
      st.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}% ${iy.toFixed(2)}% ${ix.toFixed(2)}% round ${rad.toFixed(1)}px)`;
      st.opacity = op.toFixed(3); st.zIndex = String(10 - round(ad * 3)); st.pointerEvents = op > 0.15 ? 'auto' : 'none';
      c.tabIndex = (isList ? ad < 1.3 : i === s.activeIndex) ? 0 : -1;
      c.classList.toggle('is-hover-lift', isList && ad < 0.45);
    });

    leftScroll.style.opacity = (1 - mix).toFixed(3); courseLayer.style.opacity = mix.toFixed(3);
    renderMeter(pos, mix);
    updateLabels(max(0, min(sections.length - 1, round(pos))));
    course.update(pos, mix, rm);
  };

  const tick = (now) => {
    const dt = lastT ? min(0.05, (now - lastT) / 1000) : 0.016; lastT = now;
    if (s.reducedMotion) { s.position = s.targetIndex; s.listMix = s.targetListMix; render(); raf = lastT = 0; return; }
    s.position += (s.targetIndex - s.position) * (1 - exp(-6.8 * dt));
    s.listMix += (s.targetListMix - s.listMix) * (1 - exp(-6.2 * dt));
    const pOk = abs(s.targetIndex - s.position) < 6e-4, mOk = abs(s.targetListMix - s.listMix) < 6e-4;
    if (pOk) s.position = s.targetIndex; if (mOk) s.listMix = s.targetListMix;
    render();
    if (pOk && mOk) { raf = lastT = 0; return; }
    raf = requestAnimationFrame(tick);
  };

  const wake = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); } };

  const sync = (r) => {
    const { mode, targetIndex: ti, activeIndex: ai, sections, reducedMotion: rm } = s, isList = mode === 'list';
    rp.classList.toggle('is-list', isList); shell?.classList.toggle('is-list-mode', isList);
    if (shell && (isList || r === 'open-section')) { shell.scrollTop = 0; rp.style.setProperty('--cp', '0'); shell.classList.remove('is-top-compact'); }
    if (hint) hint.textContent = isList ? 'CLICK A CARD TO OPEN' : 'SCROLL TO BROWSE';
    info.setListVisibility(isList); course.setInteractive(isList);
    if (r === 'open-section' || r === 'init') info.setSection(ai, { instant: r === 'init', reducedMotion: rm, focusHeading: r === 'open-section', announce: r === 'open-section' });
    else if (r === 'mode' && !isList) info.setSection(ai, { instant: true, reducedMotion: rm, focusHeading: true, announce: true });
    else if (r === 'mode' || r === 'step') { cards[ti]?.focus({ preventScroll: true }); announce(`Browsing sections, ${ti + 1} of ${sections.length}`); }
    measure(); wake();
  };

  const remeasure = () => { measure(); render(); };
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(remeasure, 80); });
  addEventListener('orientationchange', () => setTimeout(remeasure, 120));
  store.subscribe((_, r) => sync(r));
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 400)))(() => s.sections.forEach((sec, idx) => {
    if (idx === s.activeIndex) return;
    const img = sec.media.querySelector('img');
    if (img) { img.loading = 'eager'; img.decode?.().catch(() => {}); }
  }), { timeout: 1500 });

  measure(); sync('init');
  return { remeasure };
}
