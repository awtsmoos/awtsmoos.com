// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMenuInteraction.js
 * @description Routes meadow-menu gestures without owning disclosure state, content, or presentation.
 * The Awtsmoos joins one finite gesture to one truthful deed without crowding the vessel that receives it;
 * Awtsmoos.com lets Yesod carry close and Bag commands while Malchus keeps the visible chamber quiet and explicit.
 */

/**
 * Local delegated interaction router for the retractable meadow menu.
 */
export class YesodMeadowMenuInteraction {
	/**
	 * @description Creates a local command router whose only concern is translating menu gestures into domain events.
	 * @param {object} revelation Interaction dependencies.
	 * @param {HTMLElement} revelation.host Semantic menu host.
	 * @param {object} revelation.bus Event bus receiving established menu commands.
	 * @param {Function} revelation.onClose Callback that folds the menu.
	 */
	constructor({ host, bus, onClose }) {
		this.host = host;
		this.bus = bus;
		this.onClose = onClose;
	}

	/**
	 * @description Routes one delegated click to backdrop close, explicit close, or the Bag doorway.
	 * @param {Event} event Native click originating within the menu host.
	 * @returns {boolean} True when the interaction matched a menu command.
	 */
	handle(event) {
		const malchusTarget = event.target;
		const closeRequested = malchusTarget === this.host
			|| Boolean(malchusTarget?.closest?.('[data-close]'));
		const bagRequested = Boolean(malchusTarget?.closest?.('[data-open-bag]'));

		if (!closeRequested && !bagRequested) {
			return false;
		}

		this.onClose();

		if (bagRequested) {
			this.bus.emit('inventory:open', { source: 'menu' });
		}

		return true;
	}
}
