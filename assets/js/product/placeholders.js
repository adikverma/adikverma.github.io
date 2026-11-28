export function initPlaceholders() {
  document.querySelectorAll('[data-optional-url]').forEach((el) => {
    const href = el.getAttribute('href') || '';
    const unresolved = !href || href.includes('[[');
    el.hidden = unresolved;
  });

  document.querySelectorAll('time[data-placeholder-date]').forEach((el) => {
    const val = (el.getAttribute('datetime') || el.textContent || '').trim();
    el.hidden = !val || val.includes('[[');
  });

  document.querySelectorAll('[data-contact-email]').forEach((el) => {
    const u = (el.getAttribute('data-u') || '').trim();
    const d = (el.getAttribute('data-d') || '').trim();
    const t = (el.getAttribute('data-t') || '').trim();
    if (!u || !d || !t || u.includes('[[') || d.includes('[[') || t.includes('[[')) return;
    const addr = `${u}@${d}.${t}`;
    if (el.tagName === 'A') {
      el.setAttribute('href', `mailto:${addr}`);
      el.textContent = addr;
    } else {
      const a = document.createElement('a');
      a.href = `mailto:${addr}`;
      a.textContent = addr;
      el.replaceWith(a);
    }
  });
}
