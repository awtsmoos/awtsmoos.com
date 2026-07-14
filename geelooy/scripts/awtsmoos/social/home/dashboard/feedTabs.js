// B"H
export function bindFeedTabs() {
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-feed-mode]');
    if (!button) return;
    activateFeedTab(button);
  });
  const active = document.querySelector('[data-feed-mode].active,[data-feed-mode][aria-pressed="true"]') || document.querySelector('[data-feed-mode]');
  if (active) activateFeedTab(active, { silent: true });
}
export function activateFeedTab(button, { silent = false } = {}) {
  const mode = button.dataset.feedMode || 'forYou';
  document.querySelectorAll('[data-feed-mode]').forEach(other => {
    const active = other === button;
    other.classList.toggle('active', active);
    other.setAttribute('aria-pressed', String(active));
  });
  document.querySelector('[data-home-feed]')?.setAttribute('data-mode', mode);
  if (!silent) document.dispatchEvent(new CustomEvent('geelooy:feed-mode', { detail: { mode } }));
}
