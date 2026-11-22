export function createState(sections) {
  const subs = new Set(), rm = matchMedia?.('(prefers-reduced-motion: reduce)');
  const clamp = (i) => Math.max(0, Math.min(sections.length - 1, i));
  const fromHash = () => {
    const h = (location.hash || '').slice(1).trim().toLowerCase();
    const i = sections.findIndex((s) => s.id === h);
    return i >= 0 ? i : 0;
  };
  const init = fromHash();
  const state = { sections, mode: 'hero', targetIndex: init, activeIndex: init, position: init, listMix: 0, targetListMix: 0, reducedMotion: Boolean(rm?.matches) };
  const emit = (r) => subs.forEach((fn) => fn(state, r));
  const syncHash = (i) => {
    const h = `#${sections[i].id}`;
    if (location.hash !== h) try { history.replaceState(null, '', h); } catch {}
  };
  const enterList = () => {
    if (state.mode === 'list') return false;
    state.mode = 'list'; state.targetListMix = 1; emit('mode'); return true;
  };
  const openSection = (i, o = {}) => {
    const next = clamp(i), changed = next !== state.activeIndex, wasList = state.mode === 'list';
    state.mode = 'hero'; state.targetIndex = state.activeIndex = next; state.targetListMix = 0;
    if (o.instant || state.reducedMotion) { state.position = next; state.listMix = 0; }
    if (!o.fromHash) syncHash(next);
    emit(changed ? 'open-section' : wasList ? 'mode' : 'focus-section');
  };
  const stepList = (d) => {
    if (state.mode === 'hero') return enterList();
    const next = clamp(state.targetIndex + d);
    if (next === state.targetIndex) return false;
    state.targetIndex = next;
    if (state.reducedMotion) state.position = next;
    emit('step'); return true;
  };
  const jumpList = (i) => {
    const next = clamp(i), wasHero = state.mode === 'hero';
    state.mode = 'list'; state.targetListMix = 1;
    if (next === state.targetIndex && !wasHero) return false;
    state.targetIndex = next;
    if (state.reducedMotion) { state.position = next; state.listMix = 1; }
    emit('step'); return true;
  };
  addEventListener('hashchange', () => openSection(fromHash(), { fromHash: true }));
  rm?.addEventListener?.('change', (e) => {
    state.reducedMotion = e.matches;
    if (e.matches) { state.position = state.targetIndex; state.listMix = state.targetListMix; emit('reduced-motion'); }
  });
  return { state, subscribe: (fn) => (subs.add(fn), () => subs.delete(fn)), enterList, openSection, stepList, jumpList };
}
