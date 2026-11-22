export function initMailto() {
  const link = document.getElementById('email-link');
  if (!link) return;

  const { u, d, t } = link.dataset;
  if (!u || !d || !t) return;

  const address = `${u}@${d}.${t}`;
  link.setAttribute('href', `mailto:${address}`);
  link.textContent = `${address.toUpperCase()} ↗`;
  link.setAttribute('aria-label', `Email ${address}`);
}
