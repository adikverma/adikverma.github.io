export function initMailto() {
  const link = document.getElementById('contact-email');
  if (!link) return;

  const { u, d, t } = link.dataset;
  if (!u || !d || !t) return;

  const address = `${u}@${d}.${t}`;
  link.setAttribute('href', `mailto:${address}`);
  link.setAttribute('aria-label', `Email Aditya (${address})`);
}
