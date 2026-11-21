export function initRevealAndRoute() {
  // Keep Resume pill hidden until [[RESUME_PDF]] placeholder is replaced with a real path
  const resumeLink = document.getElementById('resume-link');
  if (resumeLink) {
    const href = (resumeLink.getAttribute('href') || '').trim();
    const isUnresolved = !href || href.includes('[[RESUME_PDF]]');
    resumeLink.hidden = isUnresolved;
  }

  // Ensure route stroke is immediately visible if reduced motion is enabled dynamically
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const path = document.querySelector('.route-path');
  const dot = document.querySelector('.route-dot');
  if (!path || !dot) return;

  if (reduced?.matches) {
    path.style.strokeDashoffset = '0';
    dot.style.opacity = '1';
  }
}
