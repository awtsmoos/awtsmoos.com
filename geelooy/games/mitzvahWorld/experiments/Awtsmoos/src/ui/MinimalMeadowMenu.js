// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenu.js
 * @description Coordinates one retractable live menu while content and presentation remain specialized modules.
 * The Awtsmoos holds many journeys inside one quiet chamber without crowding the meadow sky;
 * Awtsmoos.com lets Malchus show only the chosen layer, then fold it away when the traveler passes by.
 */

import { minimalMeadowMenuContent } from './MinimalMeadowMenuContent.js';
import { subscribeMinimalMeadowShlichus } from './MinimalMeadowMenuShlichus.js';
import { installMinimalMeadowMenuStyles } from './MinimalMeadowMenuStyles.js';

const MALCHUS_PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map',
	'menu:toggle': 'menu',
	'profile:toggle': 'profile',
	'questlog:toggle': 'quests',
	'torah:toggle': 'torah'
});

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
		this.unsubscribers = [];
		this.boundClick = event => this.handleClick(event);
		this.build();
	}

	/** Builds semantic markup, localized styles, and event subscriptions. @returns {void} */
	build() {
		installMinimalMeadowMenuStyles(this.host.ownerDocument);
		this.host.classList.add('Awtsmoos-meadow-menu');
		this.host.dataset.open = 'false';
		this.host.innerHTML = `<section class="meadow-menu-panel" role="dialog" aria-modal="true" aria-labelledby="meadow-menu-title">
			<header class="meadow-menu-header">
				<b id="meadow-menu-title" data-title></b>
				<button type="button" class="meadow-menu-close" data-close aria-label="Close menu">×</button>
			</header>
			<div class="meadow-menu-body" data-body></div>
		</section>`;
		this.host.addEventListener('click', this.boundClick);

		for (const [eventName, mode] of Object.entries(MALCHUS_PANEL_EVENTS)) {
			this.unsubscribers.push(this.bus.on(eventName, () => this.toggle(mode)));
		}

		this.unsubscribers.push(
			subscribeMinimalMeadowShlichus(this.runtime, () => this.refresh())
		);
	}

	/** Opens one mode or folds the currently visible mode. @param {string} mode Menu mode. @returns {boolean} New open state. */
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

	/** Refreshes changed title/body content without unnecessary DOM churn. @param {boolean} [force=false] Force both projections. @returns {boolean} Whether refresh was eligible. */
	refresh(force = false) {
		if (!this.mode || !this.isOpen()) {
			return false;
		}

		const malchusContent = minimalMeadowMenuContent(this.mode, this.runtime);
		this.revealChangedContent(malchusContent, force);
		return true;
	}

	/** Applies only changed title/body projections. @param {{title:string,body:string}} malchusContent Menu content. @param {boolean} force Force replacement. @returns {void} */
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

	/** Routes backdrop, close, and Open Bag actions. @param {Event} event Native click. @returns {void} */
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

	/** Releases subscriptions and delegated DOM interaction. @returns {void} */
	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}
		this.host.removeEventListener('click', this.boundClick);
	}
}
