const STORAGE_KEY = 'theme-mode';
const MODES = ['system', 'dark', 'light'];

const ICONS = {
  system:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none"/></svg>',
  dark:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  light:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
};

const LABELS = {
  system: 'System',
  dark: 'Dark',
  light: 'Light',
};

function readMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

function writeMode(mode) {
  try {
    if (mode === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {
    // storage unavailable
  }
}

function applyMode(mode) {
  const root = document.documentElement;
  if (mode === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', mode);
  }
}

export function initModeToggle() {
  const button = document.getElementById('mode-toggle');
  if (!button) return;
  const status = document.getElementById('mode-status');

  let current = readMode();

  function render(announce) {
    applyMode(current);
    const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    const label = `Color mode: ${LABELS[current]}. Switch to ${LABELS[next]}.`;
    button.innerHTML = ICONS[current];
    button.setAttribute('aria-label', label);
    button.setAttribute('title', `Theme: ${LABELS[current]}`);
    button.dataset.mode = current;
    if (announce && status) {
      status.textContent = `Color mode set to ${LABELS[current]}`;
    }
  }

  render(false);

  button.addEventListener('click', () => {
    current = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    writeMode(current);
    render(true);
    window.dispatchEvent(new CustomEvent('themechange', { detail: current }));
  });

  const media = window.matchMedia?.('(prefers-color-scheme: light)');
  media?.addEventListener?.('change', () => {
    if (current === 'system') {
      window.dispatchEvent(new CustomEvent('themechange', { detail: current }));
    }
  });
}
