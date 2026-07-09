// B"H
/**
 * @file account-panel.js
 * @description
 * One account vessel for the topbar. Portals still exist, but they wait in a
 * dropdown instead of flooding the editor sky.
 */
import { InlineLogin } from './inline-login.js';
import { displayName } from './account-panel-identity.js';
import { accountShell, onlineMenu, offlineMenu } from './account-panel-markup.js';

function loadingShell() {
  return accountShell({
    stateClass: 'is-loading',
    label: 'Checking',
    menu: '<div class="awtsmoos-account-note">Seeking identity…</div>'
  });
}

export const AwtsmoosAccountPanel = {
  el: null,
  outsideBound: false,

  init() {
    this.el = document.getElementById('awtsmoos-account-panel');
    if (!this.el) return;
    this.el.onclick = event => this.handleClick(event);
    this.bindOutsideClick();
    window.addEventListener('focus', () => this.render());
    window.addEventListener('awtsmoos-login-changed', () => this.render());
    this.render();
  },

  bindOutsideClick() {
    if (this.outsideBound) return;
    this.outsideBound = true;
    document.addEventListener('click', event => {
      if (this.el && !this.el.contains(event.target)) this.close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') this.close();
    });
  },

  close() {
    this.el?.querySelector('.awtsmoos-account-shell')?.classList.remove('is-open');
  },

  toggle() {
    this.el?.querySelector('.awtsmoos-account-shell')?.classList.toggle('is-open');
  },

  async handleClick(event) {
    const action = event.target.closest('[data-awtsmoos-account-action]')?.dataset.awtsmoosAccountAction;
    if (!action) return;
    event.stopPropagation();
    if (action === 'toggle') return this.toggle();
    if (action === 'login') return this.login();
    if (action === 'logout') return this.logout();
    if (action === 'refresh') {
      await this.render();
      window.dispatchEvent(new CustomEvent('awtsmoos-login-changed'));
    }
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
    this.el.innerHTML = loadingShell();
    const res = await InlineLogin.current();
    if (res.ok) {
      const name = displayName(res.identity);
      this.el.innerHTML = accountShell({ stateClass: 'is-online', label: `@${name}`, menu: onlineMenu(name) });
      return;
    }
    this.el.innerHTML = accountShell({ stateClass: 'is-offline', label: 'Offline', menu: offlineMenu() });
  }
};
