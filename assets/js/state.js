export function createState(sc) {
  const L = location, { max, min } = Math, subs = new Set(), rm = matchMedia?.('(prefers-reduced-motion: reduce)'), cl = (i) => max(0, min(sc.length - 1, i));
  const fromH = () => max(0, sc.findIndex((x) => x.id === (L.hash || '').slice(1).trim().toLowerCase()));
  const init = fromH(), s = { sections: sc, mode: 'hero', targetIndex: init, activeIndex: init, position: init, listMix: 0, targetListMix: 0, reducedMotion: !!rm?.matches };
  const emit = (r) => subs.forEach((fn) => fn(s, r));
  const snap = () => { s.position = s.targetIndex; s.listMix = s.targetListMix; };
  const syncH = (i) => { const h = i ? `#${sc[i].id}` : ''; if (L.hash !== h) try { history.replaceState(null, '', h || L.pathname + L.search); } catch {} };
  if (!init && L.hash) syncH(0);
  const enterList = () => (s.mode === 'list' ? false : ((s.mode = 'list'), (s.targetListMix = 1), emit('mode'), true));
  const openSection = (i, o = {}) => {
    const n = cl(i), ch = n !== s.activeIndex, was = s.mode === 'list';
    s.mode = 'hero'; s.targetIndex = s.activeIndex = n; s.targetListMix = 0;
    if (o.instant || s.reducedMotion) snap();
    if (!o.fromHash) syncH(n);
    emit(ch ? 'open-section' : was ? 'mode' : 'focus-section');
  };
  const stepList = (d) => {
    if (s.mode === 'hero') return enterList();
    const n = cl(s.targetIndex + d);
    if (n === s.targetIndex) return false;
    s.targetIndex = n; if (s.reducedMotion) s.position = n;
    emit('step'); return true;
  };
  const jumpList = (i) => {
    const n = cl(i), was = s.mode === 'hero';
    s.mode = 'list'; s.targetListMix = 1;
    if (n === s.targetIndex && !was) return false;
    s.targetIndex = n; if (s.reducedMotion) snap();
    emit('step'); return true;
  };
  addEventListener('hashchange', () => openSection(fromH(), { fromHash: true }));
  rm?.addEventListener?.('change', (e) => { s.reducedMotion = e.matches; if (e.matches) { snap(); emit('reduced-motion'); } });
  return { state: s, subscribe: (fn) => (subs.add(fn), () => subs.delete(fn)), enterList, openSection, stepList, jumpList };
}
