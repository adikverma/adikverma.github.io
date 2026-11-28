const KEY = 'rwt-theme';

export function initTheme() {
  const btn = document.getElementById('rwt-theme-toggle');
  if (!btn) return;
  const label = document.getElementById('rwt-theme-label');
  const root = document.documentElement;
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');

  const activeTheme = () => {
    const attr = root.getAttribute('data-theme');
    if (attr === 'dark' || attr === 'light') return attr;
    return mq?.matches ? 'dark' : 'light';
  };

  const render = () => {
    const isDark = activeTheme() === 'dark';
    const next = isDark ? 'Light' : 'Dark';
    if (label) label.textContent = next;
    btn.setAttribute('aria-label', `Switch to ${next.toLowerCase()} theme`);
    btn.setAttribute('aria-pressed', String(isDark));
  };

  btn.addEventListener('click', () => {
    const next = activeTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    render();
  });

  mq?.addEventListener?.('change', () => {
    if (!root.hasAttribute('data-theme')) render();
  });

  render();
}
