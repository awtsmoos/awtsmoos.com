// B"H
/** Ensures a shared toast region exists for every chamber. */
export function ensureToastRegion() {
  let region = document.querySelector('.geelooy-toast-region');
  if (region) return region;
  region = document.createElement('section');
  region.className = 'geelooy-toast-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-label', 'Geelooy notifications');
  document.body.appendChild(region);
  return region;
}
export function announceGeelooy(message, tone = 'info') {
  const notice = document.createElement('article');
  notice.className = 'geelooy-notice';
  notice.dataset.tone = tone;
  notice.textContent = message;
  ensureToastRegion().appendChild(notice);
  setTimeout(() => notice.remove(), 3600);
}
