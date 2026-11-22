export function initMailto() {
  const el = document.getElementById('email-link');
  if (!el) return;
  const { u, d, t } = el.dataset;
  if (!u || !d || !t) return;
  const a = `${u}@${d}.${t}`;
  el.href = `mailto:${a}`;
  el.textContent = `${a.toUpperCase()} ↗`;
  el.setAttribute('aria-label', `Email ${a}`);
}
