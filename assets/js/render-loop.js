export function createRenderLoop({ store, rightPanel: rp, stageCards, leftScroll, courseLayer, course, info, announce }) {
  const $ = (id) => document.getElementById(id), s = store.state;
  const edgeL = $('edge-left'), edgeR = $('edge-right'), hint = $('state-hint');
  const cIdx = $('compact-idx'), cTxt = $('compact-text');
  const rows = [$('sel-prev'), $('sel-curr'), $('sel-next')];
  let pw = 1, ph = 1, raf = 0, lastT = 0, lastIdx = -1;

  const cards = s.sections.map((sec, i) => {
    const a = document.createElement('a');
    a.className = 'card-item';
    a.href = `#${sec.id}`;
    a.setAttribute('aria-label', `Open ${sec.title}`);
    const img = sec.media.querySelector('img');
    if (img && sec.focus) img.style.objectPosition = sec.focus;
    const scrim = document.createElement('div');
    scrim.className = 'card-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    a.append(sec.media, scrim);
    stageCards.append(a);
    a.addEventListener('click', (e) => {
      e.preventDefault();
      s.mode === 'list' ? store.openSection(i) : store.enterList();
    });
    return a;
  });

  const measure = () => { const r = rp.getBoundingClientRect(); pw = Math.max(1, r.width); ph = Math.max(1, r.height); };

  const updateLabels = (idx) => {
    if (idx === lastIdx) return;
    lastIdx = idx;
    const secs = s.sections, items = [secs[idx - 1] || null, secs[idx], secs[idx + 1] || null];
    const num = String(idx + 1).padStart(2, '0');
    if (edgeL) edgeL.textContent = num;
    if (cIdx) cIdx.textContent = num;
    if (cTxt) cTxt.textContent = `${items[1].category} — ${items[1].title}`;
    if (edgeR) { edgeR.hidden = !items[1].edge; if (items[1].edge) edgeR.textContent = items[1].edge; }
    rows.forEach((row, k) => {
      if (!row) return;
      const it = items[k];
      row.dataset.empty = String(!it);
      row.querySelector('.sel-cat').textContent = it ? it.category : '';
      row.querySelector('.sel-title').textContent = it ? it.title : '';
    });
    if (s.mode === 'list') info.applyTone(items[1]);
  };

  const render = () => {
    const { position: pos, listMix: mix, mode, reducedMotion: rm, sections } = s, isList = mode === 'list';
    let cw = pw * 0.6, ch = cw * (4 / 3);
    if (ch > ph * 0.66) { ch = ph * 0.66; cw = ch * 0.75; }
    const ix = ((pw - cw) / 2 / pw) * 100 * mix, iy = ((ph - ch) / 2 / ph) * 100 * mix, rad = 14 * mix;
    const stride = ph * 1.05 + (ch * 0.72 + ph * 0.17 - ph * 1.05) * mix;

    cards.forEach((c, i) => {
      const d = i - pos, ad = Math.abs(d), sc = 1 - Math.min(1, ad) * 0.56 * mix;
      const op = mix < 0.05 ? Math.max(0, 1 - ad) : ad > 1.05 ? Math.max(0, 1 - (ad - 1.05) * 1.4) : 1 - ad * 0.14 * mix;
      const st = c.style;
      st.transform = `translate3d(0,${(d * stride).toFixed(2)}px,0) scale(${sc.toFixed(4)})`;
      st.clipPath = `inset(${iy.toFixed(2)}% ${ix.toFixed(2)}% ${iy.toFixed(2)}% ${ix.toFixed(2)}% round ${rad.toFixed(1)}px)`;
      st.opacity = op.toFixed(3);
      st.zIndex = String(10 - Math.round(ad * 3));
      st.pointerEvents = op > 0.15 ? 'auto' : 'none';
      c.tabIndex = (isList ? ad < 1.3 : i === s.activeIndex) ? 0 : -1;
      c.classList.toggle('is-hover-lift', isList && ad < 0.45);
    });

    leftScroll.style.opacity = (1 - mix).toFixed(3);
    courseLayer.style.opacity = mix.toFixed(3);
    updateLabels(Math.max(0, Math.min(sections.length - 1, Math.round(pos))));
    course.update(pos, mix, rm);
  };

  const tick = (now) => {
    const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016;
    lastT = now;
    if (s.reducedMotion) { s.position = s.targetIndex; s.listMix = s.targetListMix; render(); raf = lastT = 0; return; }
    s.position += (s.targetIndex - s.position) * (1 - Math.exp(-6.8 * dt));
    s.listMix += (s.targetListMix - s.listMix) * (1 - Math.exp(-6.2 * dt));
    const pOk = Math.abs(s.targetIndex - s.position) < 6e-4, mOk = Math.abs(s.targetListMix - s.listMix) < 6e-4;
    if (pOk) s.position = s.targetIndex;
    if (mOk) s.listMix = s.targetListMix;
    render();
    if (pOk && mOk) { raf = lastT = 0; return; }
    raf = requestAnimationFrame(tick);
  };

  const wake = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(tick); } };

  const sync = (reason) => {
    const { mode, targetIndex, activeIndex, sections, reducedMotion } = s, isList = mode === 'list';
    rp.classList.toggle('is-list', isList);
    if (hint) hint.textContent = isList ? 'CLICK A CARD TO OPEN' : 'SCROLL TO BROWSE';
    info.setListVisibility(isList);
    course.setInteractive(isList);
    if (reason === 'open-section' || reason === 'init') {
      info.setSection(activeIndex, { instant: reason === 'init', reducedMotion, focusHeading: reason === 'open-section', announce: reason === 'open-section' });
    } else if (reason === 'mode' && !isList) {
      info.setSection(activeIndex, { instant: true, reducedMotion, focusHeading: true, announce: true });
    } else if (reason === 'mode' || reason === 'step') {
      cards[targetIndex]?.focus({ preventScroll: true });
      announce(`Browsing sections, ${targetIndex + 1} of ${sections.length}`);
    }
    wake();
  };

  const remeasure = () => { measure(); render(); };
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(remeasure, 80); });
  addEventListener('orientationchange', () => setTimeout(remeasure, 120));
  rp.addEventListener('transitionend', (e) => { if (e.propertyName === 'flex-basis') remeasure(); });
  store.subscribe((_, r) => sync(r));

  (window.requestIdleCallback || ((fn) => setTimeout(fn, 400)))(() => {
    s.sections.forEach((sec, idx) => {
      if (idx === s.activeIndex) return;
      const img = sec.media.querySelector('img');
      if (img) { img.loading = 'eager'; img.decode?.().catch(() => {}); }
    });
  }, { timeout: 1500 });

  measure();
  sync('init');
  return { remeasure };
}
