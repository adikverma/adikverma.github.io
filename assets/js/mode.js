const KEY = 'theme-mode', root = document.documentElement;
const isLight = () => root.getAttribute('data-theme') === 'light';

export function initMode() {
  const btn = document.getElementById('theme-toggle');
  const lbl = document.getElementById('theme-label');
  if (!btn || !lbl) return;

  const sync = () => {
    const light = isLight();
    lbl.textContent = light ? 'Dark' : 'Light';
    btn.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} mode`);
  };

  sync();
  btn.addEventListener('click', () => {
    const next = isLight() ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch {}
    sync();
    dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });
}
