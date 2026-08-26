// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenu.js
 * @description Coordinates retractable menu state while binding, content, and presentation remain specialized modules.
 * The Awtsmoos holds many journeys inside one quiet chamber without crowding the meadow sky;
 * Awtsmoos.com lets Malchus show only the chosen layer, while Yesod quietly tends every wire nearby.
 */

import { YesodMeadowMenuBinding } from './MinimalMeadowMenuBinding.js';
import { minimalMeadowMenuContent } from './MinimalMeadowMenuContent.js';

export class MinimalMeadowMenu {
	/**
	 * @param {HTMLElement} malchusHost Existing menu mount.
	 * @param {object} yesodBus Event bus.
	 * @param {object} yesodRuntime Minimal Meadow runtime facade.
	 */
	constructor(malchusHost, yesodBus, yesodRuntime) {
		this.host = malchusHost;
		this.bus = yesodBus;
		this.runtime = yesodRuntime;
		this.mode = null;
		this.lastTitle = '';
		this.lastBody = '';
		this.boundClick = event => this.handleClick(event);
		this.binding = new YesodMeadowMenuBinding({
			host: malchusHost,
			bus: yesodBus,
			runtime: yesodRuntime,
			onToggle: mode => this.toggle(mode),
			onRefresh: () => this.refresh(),
			onClick: this.boundClick
		});
		this.binding.install();
	}

	/**
	 * Opens one mode or folds the currently visible mode.
	 * @param {string} mode Canonical menu mode.
	 * @returns {boolean} New open state.
	 */
	toggle(mode) {
		if (this.mode === mode && this.isOpen()) {
			this.close();
			return false;
		}

		this.mode = mode;
		this.host.dataset.open = 'true';
		this.refresh(true);
		this.host.querySelector('[data-close]')?.focus?.();
		return true;
	}

	/**
	 * Refreshes changed title/body content without unnecessary DOM churn.
	 * @param {boolean} [force=false] Force both projections.
	 * @returns {boolean} Whether refresh was eligible.
	 */
	refresh(force = false) {
		if (!this.mode || !this.isOpen()) {
			return false;
		}

		const malchusContent = minimalMeadowMenuContent(this.mode, this.runtime);
		this.revealChangedContent(malchusContent, force);
		return true;
	}

	/**
	 * Applies only changed title/body projections.
	 * @param {{title:string,body:string}} malchusContent Menu content.
	 * @param {boolean} force Force replacement.
	 * @returns {void}
	 */
	revealChangedContent(malchusContent, force) {
		if (force || malchusContent.title !== this.lastTitle) {
			this.host.querySelector('[data-title]').textContent = malchusContent.title;
			this.lastTitle = malchusContent.title;
		}

		if (force || malchusContent.body !== this.lastBody) {
			this.host.querySelector('[data-body]').innerHTML = malchusContent.body;
			this.lastBody = malchusContent.body;
		}
	}

	/**
	 * Routes backdrop, close, and Open Bag actions.
	 * @param {Event} event Native click.
	 * @returns {void}
	 */
	handleClick(event) {
		if (event.target === this.host || event.target.closest?.('[data-close]')) {
			this.close();
		}

		if (event.target.closest?.('[data-open-bag]')) {
			this.close();
			this.bus.emit('inventory:open', { source: 'menu' });
		}
	}

	/** @returns {boolean} Whether the menu currently owns visible interaction space. */
	isOpen() {
		return this.host.dataset.open === 'true';
	}

	/** Folds the menu without destroying its cached content. @returns {void} */
	close() {
		this.host.dataset.open = 'false';
	}

	/** Releases every DOM and event subscription owned by this menu. @returns {void} */
	destroy() {
		this.binding.destroy();
	}
}
