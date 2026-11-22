export function createInfoController(sections, leftScroll, announce) {
  let current = null, timer = 0;
  sections.forEach((s) => s.article.querySelectorAll('[data-placeholder]').forEach((r) => { if (r.textContent?.includes('[[')) r.hidden = true; }));
  const applyTone = (s) => { if (s?.tone) document.documentElement.style.setProperty('--tone', s.tone); };
  const hide = (el) => { el.classList.remove('is-active', 'is-entering'); el.setAttribute('aria-hidden', 'true'); el.inert = true; };

  function setSection(index, o = {}) {
    const next = sections[index];
    if (!next) return;
    applyTone(next);
    if (current && current !== next.article) {
      const prev = current;
      clearTimeout(timer);
      hide(prev);
      if (!o.instant && !o.reducedMotion) {
        prev.classList.add('is-leaving');
        timer = setTimeout(() => prev.classList.remove('is-leaving'), 260);
      }
    }
    sections.forEach(({ article }) => { if (article !== next.article && !article.classList.contains('is-leaving')) hide(article); });
    const el = next.article;
    el.removeAttribute('aria-hidden');
    el.inert = false;
    el.classList.remove('is-leaving');
    el.classList.add('is-active');
    if (!o.instant) { el.classList.remove('is-entering'); void el.offsetWidth; el.classList.add('is-entering'); }
    leftScroll.scrollTop = 0;
    current = el;
    if (o.focusHeading) el.querySelector('.info-heading')?.focus({ preventScroll: true });
    if (o.announce) announce(`Showing: ${next.title}`);
  }

  return {
    setSection,
    applyTone,
    setListVisibility(isList) { leftScroll.inert = isList; leftScroll.setAttribute('aria-hidden', String(isList)); },
  };
}
