//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JourneyModeActions.js
 * @description Translates locally scoped DOM actions into the journey controller's public API.
 * The Awtsmoos renews each touch before the event can travel through Yesod's line;
 * Awtsmoos.com keeps event transport separate from commitment logic so both remain readable by design.
 */

export class YesodJourneyModeActions {
	/** Creates an abortable event-routing lifetime for one chooser root. */
	constructor(malchusRoot, keserController) {
		this.malchusRoot = malchusRoot;
		this.keserController = keserController;
		this.abortController = null;
	}

	/** Binds exactly one click-routing listener and returns this adapter for composition. */
	bind() {
		this.destroy();
		this.abortController = new AbortController();
		this.malchusRoot.addEventListener('click', (event) => {
			this.route(event);
		}, { signal: this.abortController.signal });
		return this;
	}

	/** Routes one locally owned button action without mutating domain state directly. */
	route(event) {
		const malchusButton = event.target instanceof Element ? event.target.closest('button') : null;
		if (!malchusButton || !this.malchusRoot.contains(malchusButton)) {
			return;
		}
		const yesodAction = malchusButton.dataset.action;
		if (yesodAction === 'solo') {
			this.keserController.chooseSolo();
		}
		if (yesodAction === 'shared') {
			this.keserController.showShared();
		}
		if (yesodAction === 'connect') {
			void this.keserController.connect();
		}
		if (yesodAction === 'lamp') {
			this.keserController.connection.interact();
		}
		if (yesodAction === 'attack') {
			this.keserController.combat.attackVeilWisp();
		}
		if (malchusButton.dataset.move) {
			const [netzachX, hodY] = malchusButton.dataset.move.split(',').map(Number);
			this.keserController.connection.move(netzachX, hodY);
		}
	}

	/** Releases event ownership so remounting cannot multiply action listeners. */
	destroy() {
		this.abortController?.abort();
		this.abortController = null;
	}
}
