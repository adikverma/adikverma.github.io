const KEY = 'theme-mode';

const currentTheme = () => {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'light' || t === 'dark') return t;
  return matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export function initMode() {
  const btn = document.getElementById('invert-toggle');
  if (!btn) return;
  const sync = () => {
    const light = currentTheme() === 'light';
    btn.setAttribute('aria-pressed', String(light));
    btn.setAttribute('aria-label', `Invert color theme (currently ${light ? 'light' : 'dark'})`);
  };
  sync();
  btn.addEventListener('click', () => {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch {}
    sync();
    dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });
  matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', () => {
    if (!document.documentElement.getAttribute('data-theme')) {
      sync();
      dispatchEvent(new CustomEvent('themechange', { detail: currentTheme() }));
    }
  });
}
