// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenu.js
 * @description Coordinates retractable menu state while binding, content, interaction, and presentation stay specialized.
 * The Awtsmoos holds many journeys inside one quiet chamber without crowding the meadow sky;
 * Awtsmoos.com lets Malchus reveal only the chosen layer while Yesod quietly carries every wire and deed nearby.
 */

import { YesodMeadowMenuBinding } from './MinimalMeadowMenuBinding.js';
import { minimalMeadowMenuContent } from './MinimalMeadowMenuContent.js';
import { YesodMeadowMenuInteraction } from './MinimalMeadowMenuInteraction.js';

export class MinimalMeadowMenu {
	/**
	 * @description Creates the state coordinator while delegating wiring and gesture routing to focused modules.
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
		this.interaction = new YesodMeadowMenuInteraction({
			host: malchusHost,
			bus: yesodBus,
			onClose: () => this.close()
		});
		this.binding = new YesodMeadowMenuBinding({
			host: malchusHost,
			bus: yesodBus,
			runtime: yesodRuntime,
			onToggle: mode => this.toggle(mode),
			onRefresh: () => this.refresh(),
			onClick: event => this.interaction.handle(event)
		});
		this.binding.install();
	}

	/**
	 * @description Opens one mode or folds the currently visible mode, keeping disclosure state singular and predictable.
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
	 * @description Recomputes content only when the menu is visible, avoiding unnecessary DOM churn.
	 * @param {boolean} [force=false] Whether to force both title and body projection.
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
	 * @description Applies only changed title/body projections so runtime refreshes stay lightweight and visually stable.
	 * @param {{title:string,body:string}} malchusContent Menu content.
	 * @param {boolean} force Whether replacement is mandatory even when cached values match.
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
	 * @description Reports whether the menu currently owns visible interaction space.
	 * @returns {boolean} True when the menu is open.
	 */
	isOpen() {
		return this.host.dataset.open === 'true';
	}

	/**
	 * @description Folds the menu without destroying cached content or event ownership.
	 * @returns {void}
	 */
	close() {
		this.host.dataset.open = 'false';
	}

	/**
	 * @description Releases every DOM and event subscription owned by this menu coordinator.
	 * @returns {void}
	 */
	destroy() {
		this.binding.destroy();
	}
}
