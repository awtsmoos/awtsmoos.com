// B"H
export function applyLegacyShield() {
  document.documentElement.dataset.homeDashboard = 'true';
  document.body.dataset.homeDashboard = 'true';
  document.querySelectorAll('[data-legacy-home-only]').forEach(el => el.setAttribute('hidden', ''));
}
