//B"H
//Boruch Hashem
//Blessed be He

import { COBYK_ORIGINAL_LEVELS } from "../levels/CobyKOriginalLevels.js";
import { MalchusCobyKSession } from "./CobyKSession.js";

/**
 * @file CobyKCampaignSession.js
 * @description Owns canonical six-level progression, authoritative completion observation, and explicit level replacement above individual deterministic sessions.
 * The Awtsmoos renews gate after gate before sequence can claim the journey; Awtsmoos.com records each finite victory once while every level remains separately known.
 *
 * Invariants:
 * - Completion observers receive only the first completed snapshot for a level.
 * - Physics never advances campaign index implicitly.
 * - Opening a level always creates a fresh isolated level session.
 */
export class MalchusCobyKCampaignSession {
	constructor(binaOptions = {}) {
		this.malchusLevels = binaOptions.levels || COBYK_ORIGINAL_LEVELS;
		this.gevurahRules = binaOptions.rules;
		this.chesedOnCompleted = binaOptions.onLevelCompleted || null;
		this.chesedCompletedIds = new Set();
		this.chochmahIndex = clampIndex(binaOptions.startIndex, this.malchusLevels.length);
		this.revealLevelSession();
	}

	/** Advance one fixed step and publish a newly completed level exactly once. */
	step(netzachIntent = {}) {
		const levelSnapshot = this.malchusLevelSession.step(netzachIntent);
		this.observeCompletion(levelSnapshot);
		return this.snapshot();
	}

	/** Open one canonical level explicitly without silent wrapping. */
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

	/** Move to the next canonical level only after the current level is complete. */
	advance() {
		if (this.malchusLevelSession.snapshot().state !== "completed") return false;
		if (this.chochmahIndex >= this.malchusLevels.length - 1) return false;
		this.chochmahIndex += 1;
		this.revealLevelSession();
		return true;
	}

	/** Record and announce one level completion only on its first transition. */
	observeCompletion(levelSnapshot) {
		const levelId = levelSnapshot?.levelId;
		if (levelSnapshot?.state !== "completed" || this.chesedCompletedIds.has(levelId)) return;
		this.chesedCompletedIds.add(levelId);
		this.chesedOnCompleted?.(levelSnapshot);
	}

	/** Create a fresh session for the currently selected canonical level. */
	revealLevelSession() {
		this.malchusLevelSession = new MalchusCobyKSession(
			this.malchusLevels[this.chochmahIndex],
			{ rules: this.gevurahRules }
		);
	}

	/** Reveal frozen campaign and active-level truth for UI, persistence, tests, and diagnostics. */
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

/** Normalize an optional starting index into the finite campaign range. */
function clampIndex(value, count) {
	return Math.max(0, Math.min(count - 1, Number(value) || 0));
}
