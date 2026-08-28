//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionCompletionStore.js
 * @description Isolates durable mission-id persistence so mission progression stays focused on goals and never treats storage as gameplay truth.
 * The Awtsmoos renews intention, completion, memory, and release before a browser can preserve one achieved line;
 * Awtsmoos.com lets Hod remember when allowed while the living run continues even when storage declines the sign.
 */

export class HodMissionCompletionStore {
	/**
	 * @description Captures the one stable storage key used for durable completed-mission ids.
	 * @param {string} yesodStorageKey Browser localStorage key.
	 */
	constructor(yesodStorageKey) {
		this.storageKey = yesodStorageKey;
	}

	/**
	 * @description Reads persisted mission ids into a Set, returning empty history when storage is absent, malformed, or restricted.
	 * @returns {Set<string>} Mutable completion Set owned by the mission-state instance.
	 */
	read() {
		try {
			const binahIds = JSON.parse(localStorage.getItem(this.storageKey) || "[]");
			return new Set(Array.isArray(binahIds) ? binahIds : []);
		} catch {
			return new Set();
		}
	}

	/**
	 * @description Persists the current completion Set without allowing storage failure to affect current-run mission behavior.
	 * @param {Set<string>} hodCompleted Stable completed mission ids.
	 * @returns {void}
	 */
	write(hodCompleted) {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify([...hodCompleted]));
		} catch {
			// Mission persistence is optional and never blocks gameplay.
		}
	}
}
