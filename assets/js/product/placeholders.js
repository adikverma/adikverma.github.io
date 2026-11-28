export function initPlaceholders() {
  // Hide optional links whose URL is still an unresolved [[PLACEHOLDER]]
  document.querySelectorAll('[data-optional-url]').forEach((el) => {
    const href = el.getAttribute('href') || '';
    const unresolved = !href || href.includes('[[');
    el.hidden = unresolved;
  });

  // Hide unresolved [[YYYY-MM]] dev-log dates until filled in
  document.querySelectorAll('time[data-placeholder-date]').forEach((el) => {
    const val = (el.getAttribute('datetime') || el.textContent || '').trim();
    el.hidden = !val || val.includes('[[');
  });

  // Build mailto: link at runtime from split data attributes once placeholders are replaced
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
