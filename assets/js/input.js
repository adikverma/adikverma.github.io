const T = 40, Q = 120, G = 460;
const on = (el, ev, fn, o) => el?.addEventListener(ev, fn, o);

export function initInput({ rightPanel: rp, leftScroll: ls, store, shell, compactBar: bar, onCompactChange }) {
  let acc = 0, accT = 0, locked = false, gateOk = true, quietOk = true, qT = 0, gT = 0, queued = 0, cAt = 0, lastTop = 0, iy = 0;
  const mq = matchMedia('(max-width: 899px)'), s = store.state;
  const isCompact = () => shell.classList.contains('is-top-compact');

  const setCompact = (v) => {
    const next = Boolean(v && mq.matches && s.mode === 'hero');
    if (isCompact() === next) return;
    shell.classList.toggle('is-top-compact', next);
    cAt = performance.now();
    if (bar) { bar.setAttribute('aria-hidden', String(!next)); bar.tabIndex = next ? 0 : -1; }
    onCompactChange?.();
  };

  on(ls, 'scroll', () => {
    if (!mq.matches || s.mode !== 'hero') return;
    const top = ls.scrollTop;
    if (performance.now() - cAt > 420) {
      if (top > 28 && top > lastTop) setCompact(true);
      else if (top <= 6 && top < lastTop) setCompact(false);
    }
    lastTop = top;
  }, { passive: true });

  on(ls, 'touchstart', (e) => { if (e.touches.length === 1) iy = e.touches[0].clientY; }, { passive: true });
  on(ls, 'touchmove', (e) => {
    if (mq.matches && s.mode === 'hero' && e.touches.length === 1 && e.touches[0].clientY - iy > 24 && ls.scrollTop <= 4 && isCompact()) setCompact(false);
  }, { passive: true });
  on(ls, 'wheel', (e) => {
    if (mq.matches && s.mode === 'hero' && e.deltaY < -12 && ls.scrollTop <= 4 && isCompact()) setCompact(false);
  }, { passive: true });
  on(bar, 'click', (e) => {
    e.stopPropagation();
    setCompact(false);
    ls.scrollTo({ top: 0, behavior: s.reducedMotion ? 'auto' : 'smooth' });
  });

  store.subscribe((st) => { if (st.mode === 'list') setCompact(false); });
  on(mq, 'change', () => setCompact(false));

  const unlock = () => {
    if (!locked || !gateOk || !quietOk) return;
    locked = false;
    if (queued) { const d = queued; queued = 0; trigger(d); }
  };
  const resetQuiet = () => { quietOk = false; clearTimeout(qT); qT = setTimeout(() => { quietOk = true; unlock(); }, Q); };
  const trigger = (dir) => {
    if (locked) { queued = dir; return; }
    if (!store.stepList(dir)) return;
    locked = true; gateOk = false; clearTimeout(gT);
    gT = setTimeout(() => { gateOk = true; unlock(); }, s.reducedMotion ? 160 : G);
    resetQuiet();
  };

  on(rp, 'wheel', (e) => {
    if (e.ctrlKey) return;
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
    if (isCompact()) { if (dy < -8) setCompact(false); return; }
    if (Math.abs(dy) < 0.5) return;
    if (locked) { resetQuiet(); if (Math.abs(dy) >= 24) queued = dy > 0 ? 1 : -1; return; }
    if (acc && Math.sign(dy) !== Math.sign(acc)) acc = 0;
    acc += dy; clearTimeout(accT); accT = setTimeout(() => { acc = 0; }, 180);
    if (Math.abs(acc) >= T) { const d = acc > 0 ? 1 : -1; acc = 0; trigger(d); }
  }, { passive: false });

  let sx = 0, sy = 0, st = 0, done = false;
  on(rp, 'touchstart', (e) => {
    if (e.touches.length !== 1) return;
    sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = performance.now(); done = false;
  }, { passive: true });
  on(rp, 'touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
    if (Math.abs(dy) > Math.abs(dx)) {
      e.preventDefault();
      if (isCompact()) { if (!done && dy >= 18) { done = true; setCompact(false); } return; }
      if (!done && Math.abs(dy) >= T) { done = true; trigger(dy < 0 ? 1 : -1); }
    }
  }, { passive: false });
  on(rp, 'touchend', (e) => {
    if (done || isCompact() || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) >= 18 && Math.abs(dy) / Math.max(1, performance.now() - st) >= 0.35) trigger(dy < 0 ? 1 : -1);
  }, { passive: true });

  on(document, 'keydown', (e) => {
    const el = document.activeElement, tag = el?.tagName || '';
    if ((el && ls.contains(el)) || /INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !/BUTTON|A/.test(tag))) { e.preventDefault(); trigger(1); }
    else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); trigger(-1); }
    else if (e.key === 'Home') { e.preventDefault(); store.jumpList(0); }
    else if (e.key === 'End') { e.preventDefault(); store.jumpList(s.sections.length - 1); }
    else if (e.key === 'Escape' && s.mode === 'list') { e.preventDefault(); store.openSection(s.targetIndex); }
  });

  rp.querySelectorAll('[data-step]').forEach((btn) => on(btn, 'click', (e) => {
    e.stopPropagation();
    const target = s.targetIndex + Number(btn.dataset.step);
    if (target < 0 || target >= s.sections.length) return;
    s.mode === 'hero' ? store.openSection(target) : store.jumpList(target);
  }));
}
