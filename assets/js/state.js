export function createState(sections) {
  const subs = new Set(), rm = matchMedia?.('(prefers-reduced-motion: reduce)'), clamp = (i) => Math.max(0, Math.min(sections.length - 1, i));
  const fromHash = () => Math.max(0, sections.findIndex((s) => s.id === (location.hash || '').slice(1).trim().toLowerCase()));
  const init = fromHash(), s = { sections, mode: 'hero', targetIndex: init, activeIndex: init, position: init, listMix: 0, targetListMix: 0, reducedMotion: Boolean(rm?.matches) };
  const emit = (r) => subs.forEach((fn) => fn(s, r));
  const syncHash = (i) => { const h = `#${sections[i].id}`; if (location.hash !== h) try { history.replaceState(null, '', h); } catch {} };
  const enterList = () => (s.mode === 'list' ? false : ((s.mode = 'list'), (s.targetListMix = 1), emit('mode'), true));
  const openSection = (i, o = {}) => {
    const n = clamp(i), ch = n !== s.activeIndex, was = s.mode === 'list';
    s.mode = 'hero'; s.targetIndex = s.activeIndex = n; s.targetListMix = 0;
    if (o.instant || s.reducedMotion) { s.position = n; s.listMix = 0; }
    if (!o.fromHash) syncHash(n);
    emit(ch ? 'open-section' : was ? 'mode' : 'focus-section');
  };
  const stepList = (d) => {
    if (s.mode === 'hero') return enterList();
    const n = clamp(s.targetIndex + d);
    if (n === s.targetIndex) return false;
    s.targetIndex = n; if (s.reducedMotion) s.position = n;
    emit('step'); return true;
  };
  const jumpList = (i) => {
    const n = clamp(i), was = s.mode === 'hero';
    s.mode = 'list'; s.targetListMix = 1;
    if (n === s.targetIndex && !was) return false;
    s.targetIndex = n; if (s.reducedMotion) { s.position = n; s.listMix = 1; }
    emit('step'); return true;
  };
  addEventListener('hashchange', () => openSection(fromHash(), { fromHash: true }));
  rm?.addEventListener?.('change', (e) => { s.reducedMotion = e.matches; if (e.matches) { s.position = s.targetIndex; s.listMix = s.targetListMix; emit('reduced-motion'); } });
  return { state: s, subscribe: (fn) => (subs.add(fn), () => subs.delete(fn)), enterList, openSection, stepList, jumpList };
}
