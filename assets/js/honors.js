export function initHonors() {
  const details = document.getElementById('honors');
  if (!details) return;
  const summary = details.querySelector('summary');
  if (!summary) return;

  const desktopQuery = window.matchMedia('(min-width: 1024px) and (hover: hover)');
  let closeTimer = 0;

  function cancelClose() {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
    }
  }

  details.addEventListener('pointerenter', (event) => {
    if (!desktopQuery.matches || event.pointerType === 'touch') return;
    cancelClose();
    details.open = true;
  });

  details.addEventListener('pointerleave', (event) => {
    if (!desktopQuery.matches || event.pointerType === 'touch') return;
    cancelClose();
    closeTimer = window.setTimeout(() => {
      if (!details.matches(':focus-within')) {
        details.open = false;
      }
    }, 180);
  });

  details.addEventListener('focusin', () => {
    if (desktopQuery.matches) {
      cancelClose();
      details.open = true;
    }
  });

  details.addEventListener('focusout', (event) => {
    if (!desktopQuery.matches) return;
    const next = event.relatedTarget;
    if (!next || !details.contains(next)) {
      details.open = false;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && details.open) {
      details.open = false;
      summary.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (details.open && !details.contains(event.target)) {
      details.open = false;
    }
  });
}
