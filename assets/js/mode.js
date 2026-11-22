const KEY = 'theme-mode', root = document.documentElement, mq = matchMedia?.('(prefers-color-scheme: light)');
const theme = () => { const t = root.getAttribute('data-theme'); return t === 'light' || t === 'dark' ? t : mq?.matches ? 'light' : 'dark'; };

export function initMode() {
  const btn = document.getElementById('invert-toggle');
  if (!btn) return;
  const sync = () => {
    const light = theme() === 'light';
    btn.setAttribute('aria-pressed', String(light));
    btn.setAttribute('aria-label', `Invert color theme (currently ${light ? 'light' : 'dark'})`);
  };
  sync();
  btn.addEventListener('click', () => {
    const next = theme() === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch {}
    sync();
    dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });
  mq?.addEventListener?.('change', () => {
    if (!root.getAttribute('data-theme')) { sync(); dispatchEvent(new CustomEvent('themechange', { detail: theme() })); }
  });
}
