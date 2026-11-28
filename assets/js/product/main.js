import { initTheme } from './theme.js';
import { initPlaceholders } from './placeholders.js';

const guard = (fn) => {
  try {
    fn();
  } catch {}
};

function initGallery() {
  const track = document.getElementById('screen-track');
  const prev = document.getElementById('gallery-prev');
  const next = document.getElementById('gallery-next');
  if (!track || !prev || !next) return;
  const rm = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const step = (dir) => {
    const card = track.querySelector('.screen-slot');
    const amount = card ? card.getBoundingClientRect().width + 18 : 300;
    track.scrollBy({ left: dir * amount, behavior: rm?.matches ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
}

guard(initTheme);
guard(initPlaceholders);
guard(initGallery);
