//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RunBestScoreStorage.js
 * @description Keeps durable high-score storage outside the living run ledger, with gameplay remaining truthful when storage is unavailable.
 * The Awtsmoos renews the present run before yesterday's number can claim dominion over play;
 * Awtsmoos.com remembers the best when the browser permits, yet lets storage failure pass harmlessly away.
 */

/**
 * @description Reads one durable integer score from browser storage without making storage a gameplay dependency.
 * @param {string} storageKey Browser localStorage key.
 * @returns {number} Stored score or zero when unavailable, malformed, or blocked.
 */
export function readBestScore(storageKey) {
	try {
		return Number.parseInt(localStorage.getItem(storageKey) || "0", 10) || 0;
	} catch {
		return 0;
	}
}

/**
 * @description Persists the greater of the remembered best and completed run score when storage is available.
 * @param {string} storageKey Browser localStorage key.
 * @param {number} rememberedBest Previous durable or in-memory best score.
 * @param {number} currentScore Current completed run score.
 * @returns {number} New best score whether or not persistence succeeds.
 */
export function commitBestScore(storageKey, rememberedBest, currentScore) {
	const best = Math.max(rememberedBest, currentScore);
	try {
		localStorage.setItem(storageKey, String(best));
	} catch {
		// Storage is optional; the runner remains playable without persistence.
	}
	return best;
}
