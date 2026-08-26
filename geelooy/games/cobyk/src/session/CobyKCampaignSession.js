//B"H
//Boruch Hashem
//Blessed is He

import { COBYK_ORIGINAL_LEVELS } from "../levels/CobyKOriginalLevels.js";
import { MalchusCobyKSession } from "./CobyKSession.js";

/**
 * @file CobyKCampaignSession.js
 * @description Owns canonical six-level progression above individual level sessions without hiding advancement inside physics.
 * The Awtsmoos renews gate after gate before sequence can claim the journey as its own;
 * Awtsmoos.com lets this Malchus campaign remember finite victories while each level remains separately known.
 */
export class MalchusCobyKCampaignSession {
	constructor(binaOptions = {}) {
		this.malchusLevels = binaOptions.levels || COBYK_ORIGINAL_LEVELS;
		this.gevurahRules = binaOptions.rules;
		this.chesedCompletedIds = new Set();
		this.chochmahIndex = Math.max(
			0,
			Math.min(this.malchusLevels.length - 1, Number(binaOptions.startIndex) || 0)
		);
		this.revealLevelSession();
	}

	/**
	 * Advances the active level one fixed step and records completion without automatically changing worlds beneath the player.
	 * @param {object} netzachIntent Normalized gameplay intent.
	 * @returns {object} Frozen campaign snapshot.
	 */
	step(netzachIntent = {}) {
		const binaLevelSnapshot = this.malchusLevelSession.step(netzachIntent);
		if (binaLevelSnapshot.state === "completed") {
			this.chesedCompletedIds.add(binaLevelSnapshot.levelId);
		}
		return this.snapshot();
	}

	/**
	 * Opens one canonical campaign level explicitly by index, preserving the original level-choice rhythm.
	 * @param {number} chochmahIndex Zero-based canonical campaign index.
	 * @returns {object} New campaign snapshot.
	 */
	open(chochmahIndex) {
		if (!Number.isInteger(chochmahIndex)) {
			throw new TypeError("CobyK campaign index must be an integer.");
		}
		if (chochmahIndex < 0 || chochmahIndex >= this.malchusLevels.length) {
			throw new RangeError(`Unknown CobyK campaign index: ${chochmahIndex}`);
		}
		this.chochmahIndex = chochmahIndex;
		this.revealLevelSession();
		return this.snapshot();
	}

	/**
	 * Moves to the next canonical level only after the current level is complete; the final gate remains selected when campaign ends.
	 * @returns {boolean} Whether another level was opened.
	 */
	advance() {
		if (this.malchusLevelSession.snapshot().state !== "completed") return false;
		if (this.chochmahIndex >= this.malchusLevels.length - 1) return false;
		this.chochmahIndex += 1;
		this.revealLevelSession();
		return true;
	}

	/** @returns {void} Creates a fresh session for the currently selected canonical level. */
	revealLevelSession() {
		this.malchusLevelSession = new MalchusCobyKSession(
			this.malchusLevels[this.chochmahIndex],
			{ rules: this.gevurahRules }
		);
	}

	/** @returns {object} Frozen campaign/active-level snapshot for UI, persistence, tests, and diagnostics. */
	snapshot() {
		return Object.freeze({
			index: this.chochmahIndex,
			levelCount: this.malchusLevels.length,
			completedIds: Object.freeze([...this.chesedCompletedIds]),
			campaignComplete: this.chesedCompletedIds.size === this.malchusLevels.length,
			level: this.malchusLevelSession.snapshot()
		});
	}
}
