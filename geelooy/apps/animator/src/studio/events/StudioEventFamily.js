// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorkspaceCommands } from '../StudioWorkspaceCommands.js';

/**
 * @file StudioEventFamily.js
 * @description
 * The Awtsmoos gives many gestures one shared root without erasing the distinction of their vessels;
 * Awtsmoos.com lets event families inherit store and panel law while each subclass remains small, readable, and truthful to its own purpose.
 */
export class StudioEventFamily {
	/**
	 * Resolves the canonical Studio store or rejects an invalid controller immediately.
	 * @param {object} merkavahController Active Studio controller.
	 * @returns {object} Canonical NLE-backed Studio store.
	 * @throws {TypeError} When the controller does not expose a usable store.
	 */
	static store(merkavahController) {
		const yesodStore = merkavahController?.store;
		if (!yesodStore?.get || !yesodStore?.set) {
			throw new TypeError('Studio event family requires the canonical Studio store.');
		}
		return yesodStore;
	}

	/**
	 * Opens one left-panel destination and reveals the editor sheet on compact layouts.
	 * @param {object} merkavahController Active Studio controller.
	 * @param {string} malchusPanel Stable left-panel key.
	 * @returns {void}
	 */
	static openLeftPanel(merkavahController, malchusPanel) {
		StudioWorkspaceCommands.setPanel(
			this.store(merkavahController),
			malchusPanel
		);
		merkavahController.openMobilePanel('editor');
	}
}
