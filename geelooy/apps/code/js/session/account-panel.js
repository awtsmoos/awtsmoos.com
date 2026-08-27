// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file account-panel.js
 * @description
 * One account vessel for the Awtsmoos Code topbar. The immutable PORTALS ledger
 * binds identity to Treasury, Bank, Tunnel Control, Code, and the Virtual OS.
 */

import { InlineLogin } from './inline-login.js';
import { displayName } from './account-panel-identity.js';
import { accountShell, onlineMenu, offlineMenu } from './account-panel-markup.js';

export const PORTALS = Object.freeze([
	['Treasury', '/api/tunnel/control/treasury/home'],
	['Budgets', '/api/tunnel/control/treasury/budgets'],
	['Bank', '/api/tunnel/control/bank'],
	['Tunnel', '/apps/tunnel-control/'],
	['Code', '/apps/code/'],
	['OS', '/os']
]);

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
		this.el?.querySelector('.awtsmoos-account-shell')
			?.classList.remove('is-open');
	},

	toggle() {
		this.el?.querySelector('.awtsmoos-account-shell')
			?.classList.toggle('is-open');
	},

	async handleClick(event) {
		const action = event.target
			.closest('[data-awtsmoos-account-action]')
			?.dataset.awtsmoosAccountAction;
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
		const response = await InlineLogin.ensure();
		window.dispatchEvent(new CustomEvent('awtsmoos-login-changed', {
			detail: response.identity
		}));
		this.render();
	},

	logout() {
		const next = encodeURIComponent(
			location.pathname + location.search + location.hash
		);
		location.href = `/logout?next=${next}`;
	},

	async render() {
		if (!this.el) return;
		this.el.innerHTML = loadingShell();
		const response = await InlineLogin.current();
		if (response.ok) {
			const name = displayName(response.identity);
			this.el.innerHTML = accountShell({
				stateClass: 'is-online',
				label: `@${name}`,
				menu: onlineMenu(name, PORTALS)
			});
			return;
		}
		this.el.innerHTML = accountShell({
			stateClass: 'is-offline',
			label: 'Offline',
			menu: offlineMenu(PORTALS)
		});
	}
};
