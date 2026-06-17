// B"H
import { InlineLogin } from './inline-login.js';

const IDENTITY_NAME_KEYS = Object.freeze(['username', 'userName', 'displayName', 'name', 'email', 'userId', 'userid', 'id', '_id', 'sub']);
const NESTED_IDENTITY_KEYS = Object.freeze(['identity', 'user', 'profile', 'account', 'session']);
const PORTALS = Object.freeze([
  ['Treasury', '/api/tunnel/control/treasury/home'],
  ['Budgets', '/api/tunnel/control/treasury/budgets'],
  ['Bank', '/api/tunnel/control/bank'],
  ['OS', '/os'],
  ['Tunnel', '/apps/tunnel-control/']
]);

function clean(value) {
  const text = String(value ?? '').trim();
  if (!text || text === '[object Object]' || text.toLowerCase() === 'logged in') return '';
  return text;
}

function findName(identity, seen = new Set()) {
  if (!identity || typeof identity !== 'object' || seen.has(identity)) return '';
  seen.add(identity);
  for (const key of IDENTITY_NAME_KEYS) {
    const got = clean(identity[key]);
    if (got) return key === 'email' ? got : got.replace(/^@+/, '');
  }
  for (const key of NESTED_IDENTITY_KEYS) {
    const got = findName(identity[key], seen);
    if (got) return got;
  }
  return '';
}

function displayName(identity) {
  const found = findName(identity);
  return found ? `@${found.replace(/^@+/, '')}` : 'unknown user';
}

function portalLinks() {
  return `<span class="awtsmoos-portal-links">${PORTALS.map(([label, href]) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`).join('')}</span>`;
}

function renderShell({ statusClass, label, actions }) {
  return `
    <div class="awtsmoos-account-pill ${statusClass}">
      <span class="awtsmoos-account-name" title="Awtsmoos Account">${label}</span>
      ${portalLinks()}
      ${actions}
    </div>
  `;
}

export const AwtsmoosAccountPanel = {
  el: null,

  init() {
    this.el = document.getElementById('awtsmoos-account-panel');
    if (!this.el) return;
    this.ensurePortalStyle();
    this.el.onclick = e => {
      const btn = e.target.closest('[data-awtsmoos-account-action]');
      const action = btn?.dataset.awtsmoosAccountAction;
      if (action === 'login') this.login();
      if (action === 'refresh') {
        this.render();
        window.dispatchEvent(new CustomEvent('awtsmoos-login-changed'));
      }
      if (action === 'logout') this.logout();
    };
    window.addEventListener('focus', () => this.render());
    window.addEventListener('awtsmoos-login-changed', () => this.render());
    this.render();
  },

  ensurePortalStyle() {
    if (document.getElementById('awtsmoos-account-portal-style')) return;
    const style = document.createElement('style');
    style.id = 'awtsmoos-account-portal-style';
    style.textContent = `.awtsmoos-account-pill{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.awtsmoos-portal-links{display:inline-flex;gap:4px;flex-wrap:wrap}.awtsmoos-portal-links a{font-size:11px;padding:6px 8px;border-radius:999px;border:1px solid rgba(0,246,255,.25);color:var(--neon-cyan);text-decoration:none;background:rgba(0,246,255,.07)}.awtsmoos-portal-links a:hover{background:rgba(0,246,255,.18);box-shadow:0 0 10px rgba(0,246,255,.22)}`;
    document.head.appendChild(style);
  },

  async login() {
    const res = await InlineLogin.ensure();
    window.dispatchEvent(new CustomEvent('awtsmoos-login-changed', { detail: res.identity }));
    this.render();
  },

  logout() {
    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    location.href = '/logout?next=' + next;
  },

  async render() {
    if (!this.el) return;
    this.el.innerHTML = renderShell({ statusClass: 'is-loading', label: 'Awtsmoos checking…', actions: '' });
    const res = await InlineLogin.current();
    if (res.ok) {
      this.el.innerHTML = renderShell({
        statusClass: 'is-online',
        label: `✓ ${displayName(res.identity)}`,
        actions: `<button class="secondary-btn" data-awtsmoos-account-action="refresh">Refresh</button><button class="secondary-btn" data-awtsmoos-account-action="logout">Log out</button>`
      });
      return;
    }
    this.el.innerHTML = renderShell({
      statusClass: 'is-offline',
      label: 'Awtsmoos offline',
      actions: `<button class="primary-btn" data-awtsmoos-account-action="login">Log in</button><button class="secondary-btn" data-awtsmoos-account-action="refresh">Check</button>`
    });
  }
};
