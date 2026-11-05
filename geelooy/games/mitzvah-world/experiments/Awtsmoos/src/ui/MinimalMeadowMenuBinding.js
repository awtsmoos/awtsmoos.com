// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuBinding.js
 * @description Owns meadow-menu DOM installation and event subscription lifecycle without owning menu state.
 * The Awtsmoos binds every visible vessel to its source without confusing the vessel for the light;
 * Awtsmoos.com lets Yesod wire markup and events once, while Malchus keeps disclosure simple and bright.
 */

import { subscribeMinimalMeadowShlichus } from './MinimalMeadowMenuShlichus.js';
import { installMinimalMeadowMenuStyles } from './MinimalMeadowMenuStyles.js';

const MALCHUS_PANEL_EVENTS = Object.freeze({
	'map:toggle': 'map',
	'menu:toggle': 'menu',
	'profile:toggle': 'profile',
	'questlog:toggle': 'quests',
	'torah:toggle': 'torah'
});

/**
 * Wiring vessel for one meadow menu host.
 */
export class YesodMeadowMenuBinding {
	/**
	 * @param {object} revelation Binding dependencies.
	 * @param {HTMLElement} revelation.host Existing menu mount.
	 * @param {object} revelation.bus Event bus.
	 * @param {object} revelation.runtime Minimal Meadow runtime facade.
	 * @param {Function} revelation.onToggle Menu-mode toggle callback.
	 * @param {Function} revelation.onRefresh Shlichus refresh callback.
	 * @param {Function} revelation.onClick Delegated click callback.
	 */
	constructor({ host, bus, runtime, onToggle, onRefresh, onClick }) {
		this.host = host;
		this.bus = bus;
		this.runtime = runtime;
		this.onToggle = onToggle;
		this.onRefresh = onRefresh;
		this.onClick = onClick;
		this.unsubscribers = [];
	}

	/**
	 * Installs semantic markup, localized styles, and all menu-related subscriptions.
	 * @returns {void}
	 */
	install() {
		installMinimalMeadowMenuStyles(this.host.ownerDocument);
		this.host.classList.add('Awtsmoos-meadow-menu');
		this.host.dataset.open = 'false';
		this.host.innerHTML = revealMeadowMenuMarkup();
		this.host.addEventListener('click', this.onClick);

		for (const [eventName, mode] of Object.entries(MALCHUS_PANEL_EVENTS)) {
			this.unsubscribers.push(
				this.bus.on(eventName, () => this.onToggle(mode))
			);
		}

		this.unsubscribers.push(
			subscribeMinimalMeadowShlichus(this.runtime, this.onRefresh)
		);
	}

	/**
	 * Releases every subscription and DOM listener owned by the binding.
	 * @returns {void}
	 */
	destroy() {
		for (const unsubscribe of this.unsubscribers) {
			unsubscribe();
		}

		this.unsubscribers.length = 0;
		this.host.removeEventListener('click', this.onClick);
	}
}

/**
 * Reveals one semantic menu shell whose deeper content is projected separately.
 * @returns {string} Stable internal menu markup.
 */
function revealMeadowMenuMarkup() {
	return `<section class="meadow-menu-panel" role="dialog" aria-modal="true" aria-labelledby="meadow-menu-title">
		<header class="meadow-menu-header">
			<b id="meadow-menu-title" data-title></b>
			<button type="button" class="meadow-menu-close" data-close aria-label="Close menu">×</button>
		</header>
		<div class="meadow-menu-body" data-body></div>
	</section>`;
}
