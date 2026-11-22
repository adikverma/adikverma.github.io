const T = 40, Q = 120, G = 460, { abs, max, min, sign } = Math, on = (el, ev, fn, o) => el?.addEventListener(ev, fn, o);

export function initInput({ rightPanel: rp, leftScroll: ls, store, shell, compactBar: bar }) {
  let acc = 0, accT = 0, locked = false, gateOk = true, quietOk = true, qT = 0, gT = 0, queued = 0, sx = 0, sy = 0, st = 0, done = false;
  const mq = matchMedia('(max-width: 899px)'), s = store.state;
  const expandTop = () => shell.scrollTo({ top: 0, behavior: s.reducedMotion ? 'auto' : 'smooth' });

  const syncCollapse = () => {
    const p = mq.matches && s.mode === 'hero' ? max(0, min(1, shell.scrollTop / max(1, rp.offsetHeight - 58))) : 0;
    rp.style.setProperty('--cp', p.toFixed(3));
    const c = p > 0.85;
    shell.classList.toggle('is-top-compact', c);
    if (bar) { bar.setAttribute('aria-hidden', String(!c)); bar.tabIndex = c ? 0 : -1; }
  };

  on(shell, 'scroll', syncCollapse, { passive: true });
  on(bar, 'click', (e) => { e.stopPropagation(); expandTop(); });
  on(mq, 'change', syncCollapse);
  store.subscribe(syncCollapse);

  const unlock = () => { if (locked && gateOk && quietOk) { locked = false; if (queued) { const d = queued; queued = 0; trigger(d); } } };
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
    if (shell.classList.contains('is-top-compact')) { if (dy < -8) expandTop(); return; }
    if (abs(dy) < 0.5) return;
    if (locked) { resetQuiet(); if (abs(dy) >= 24) queued = dy > 0 ? 1 : -1; return; }
    if (acc && sign(dy) !== sign(acc)) acc = 0;
    acc += dy; clearTimeout(accT); accT = setTimeout(() => { acc = 0; }, 180);
    if (abs(acc) >= T) { const d = acc > 0 ? 1 : -1; acc = 0; trigger(d); }
  }, { passive: false });

  on(rp, 'touchstart', (e) => { if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = performance.now(); done = false; } }, { passive: true });
  on(rp, 'touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
    if (abs(dy) > abs(dx)) {
      e.preventDefault();
      if (mq.matches && shell.scrollTop > 4) { if (!done && dy >= 18) { done = true; expandTop(); } return; }
      if (!done && abs(dy) >= T) { done = true; trigger(dy < 0 ? 1 : -1); }
    }
  }, { passive: false });
  on(rp, 'touchend', (e) => {
    if (done || (mq.matches && shell.scrollTop > 4) || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (abs(dy) > abs(dx) && abs(dy) >= 18 && abs(dy) / max(1, performance.now() - st) >= 0.35) trigger(dy < 0 ? 1 : -1);
  }, { passive: true });

  on(document, 'keydown', (e) => {
    const el = document.activeElement, tag = el?.tagName || '', k = e.key;
    if ((el && ls.contains(el)) || /INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !/BUTTON|A/.test(tag))) { e.preventDefault(); trigger(1); }
    else if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); trigger(-1); }
    else if (k === 'Home') { e.preventDefault(); store.jumpList(0); }
    else if (k === 'End') { e.preventDefault(); store.jumpList(s.sections.length - 1); }
    else if (k === 'Escape' && s.mode === 'list') { e.preventDefault(); store.openSection(s.targetIndex); }
  });
}
