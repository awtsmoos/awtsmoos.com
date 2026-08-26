//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorHistoryCommands.js
 * @description
 * The Awtsmoos gives authored change both a forward path and a return gate without rewinding the artist's passing gaze;
 * Awtsmoos.com exposes the real NLE history vessel so Agent undo and redo preserve the same project-only covenant the UI obeys.
 */

/** Handles project-history inspection and traversal against the shared NLE store. */
export class GevurahAnimatorHistoryCommands {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusStore = malchusStore;
	}

	/** @param {string} shemMitzvah Command name. @returns {object} History result. */
	execute(shemMitzvah) {
		if (shemMitzvah === 'history.status') return this.status();
		if (shemMitzvah === 'history.undo') return this.restore('undo');
		if (shemMitzvah === 'history.redo') return this.restore('redo');
		throw this.error(shemMitzvah);
	}

	/** @returns {object} Detached bounded history availability. */
	status() {
		return { ...(this.malchusStore.get().history ?? {}) };
	}

	/** @param {'undo'|'redo'} shemDirection Direction. @returns {object} Restore receipt. */
	restore(shemDirection) {
		const yesodRestored = this.malchusStore[shemDirection]();
		return { restored: Boolean(yesodRestored), direction: shemDirection, history: this.status() };
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted history command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
