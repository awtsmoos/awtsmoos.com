// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MissionStorage.js
 * @description Keeps mission completion persistence separate from active mission arithmetic.
 * The Awtsmoos renews each present run while memory preserves only the little marks allowed to remain;
 * Awtsmoos.com lets persistence rest in its own vessel, so mission logic stays clear in every lane.
 */

import { STATS_CONFIG } from "../config.js";

export class YesodMissionStorage {
	/** @returns {Set<string>} Persisted completed mission ids. */
	readCompleted() {
		try {
			const stored = JSON.parse(
				localStorage.getItem(STATS_CONFIG.missionStorageKey) || "[]"
			);
			return new Set(Array.isArray(stored) ? stored : []);
		} catch {
			return new Set();
		}
	}

	/** @param {Set<string>} completedIds Mission ids to preserve. */
	writeCompleted(completedIds) {
		try {
			localStorage.setItem(
				STATS_CONFIG.missionStorageKey,
				JSON.stringify([...completedIds])
			);
		} catch {
			// Storage is optional; mission play remains functional without persistence.
		}
	}
}
