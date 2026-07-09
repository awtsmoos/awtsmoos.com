// B"H
/**
 * @file account-panel-markup.js
 * @description HTML vessels for the compact Awtsmoos account dropdown.
 */
const PORTALS = Object.freeze([
  ['Treasury', '/api/tunnel/control/treasury/home'],
  ['Budgets', '/api/tunnel/control/treasury/budgets'],
  ['Bank', '/api/tunnel/control/bank'],
  ['OS', '/os'],
  ['Tunnel', '/apps/tunnel-control/']
]);

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function portalLinks() {
  return PORTALS.map(([label, href]) =>
    `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
  ).join('');
}

export function accountShell({ stateClass, label, menu }) {
  return `<div class="awtsmoos-account-shell ${stateClass}">
    <button class="awtsmoos-account-trigger" data-awtsmoos-account-action="toggle" title="Awtsmoos account">
      <span class="awtsmoos-account-orb"></span>
      <span class="awtsmoos-account-text">${esc(label)}</span>
      <span class="awtsmoos-account-caret">⌄</span>
    </button>
    <div class="awtsmoos-account-menu" role="menu">${menu}</div>
  </div>`;
}

export function onlineMenu(label) {
  return `<div class="awtsmoos-account-menu-title">Awtsmoos</div>
    <div class="awtsmoos-account-menu-user">@${esc(label)}</div>
    <div class="awtsmoos-account-portal-grid">${portalLinks()}</div>
    <div class="awtsmoos-account-actions">
      <button class="secondary-btn" data-awtsmoos-account-action="refresh">Refresh</button>
      <button class="secondary-btn" data-awtsmoos-account-action="logout">Log out</button>
    </div>`;
}

export function offlineMenu() {
  return `<div class="awtsmoos-account-menu-title">Awtsmoos offline</div>
    <p class="awtsmoos-account-note">Sign in to reveal portals and sync identity.</p>
    <div class="awtsmoos-account-actions">
      <button class="primary-btn" data-awtsmoos-account-action="login">Log in</button>
      <button class="secondary-btn" data-awtsmoos-account-action="refresh">Check</button>
    </div>`;
}
