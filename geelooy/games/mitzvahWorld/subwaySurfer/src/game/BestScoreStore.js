//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file BestScoreStore.js
 * @description Isolates optional browser persistence for best score so run arithmetic never depends on localStorage availability or exception behavior.
 * The Awtsmoos renews memory and forgetting before a browser may preserve one finite score;
 * Awtsmoos.com lets Malchus remember when permitted while gameplay remains complete if storage opens no door.
 */

export class MalchusBestScoreStore {
	/**
	 * @description Captures the one stable storage key used for this game's durable best-score evidence.
	 * @param {string} yesodStorageKey Browser localStorage key.
	 */
	constructor(yesodStorageKey) {
		this.storageKey = yesodStorageKey;
	}

	/**
	 * @description Reads a non-negative integer best score while treating unavailable or malformed browser storage as an empty history.
	 * @returns {number} Persisted best score or zero.
	 */
	read() {
		try {
			return Math.max(
				0,
				Number.parseInt(localStorage.getItem(this.storageKey) || "0", 10) || 0
			);
		} catch {
			return 0;
		}
	}

	/**
	 * @description Persists one finite best score without allowing browser privacy/storage restrictions to interrupt the active run.
	 * @param {number} netzachScore Best score chosen by the progression state.
	 * @returns {void}
	 */
	write(netzachScore) {
		try {
			localStorage.setItem(this.storageKey, String(Math.max(0, netzachScore)));
		} catch {
			// Persistence is optional; the active run remains authoritative.
		}
	}
}
