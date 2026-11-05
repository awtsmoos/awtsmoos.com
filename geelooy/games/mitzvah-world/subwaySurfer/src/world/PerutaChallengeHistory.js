//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaChallengeHistory.js
 * @description Remembers only a few recently selected pattern identities and action signatures so deterministic difficulty can avoid monotonous repetition without becoming random.
 * The Awtsmoos renews every rhythm while memory remains finite and does not create the next road;
 * Awtsmoos.com lets Netzach remember enough of yesterday to keep tomorrow varied without carrying an endless load.
 */

const HISTORY_LIMIT = 4;

export class NetzachPerutaChallengeHistory {
	/** @description Creates an empty bounded selection memory. */
	constructor() {
		this.reset();
	}

	/** @description Removes all recent-pattern evidence for deterministic restart/tutorial playback. @returns {void} */
	reset() {
		this.recent = [];
	}

	/**
	 * @description Records one chosen annotated pattern and evicts history beyond the tiny fixed memory limit.
	 * @param {Readonly<object>} tiferesPattern Selected pattern carrying stable `id` and `actionSignature`.
	 * @returns {void}
	 */
	remember(tiferesPattern) {
		this.recent.unshift(Object.freeze({
			id: tiferesPattern.id,
			actionSignature: tiferesPattern.actionSignature
		}));
		this.recent.length = Math.min(this.recent.length, HISTORY_LIMIT);
	}

	/**
	 * @description Computes a deterministic repetition cost that strongly discourages exact immediate replay and mildly discourages recently repeated action-law signatures.
	 * @param {Readonly<object>} tiferesPattern Candidate annotated pattern.
	 * @returns {number} Non-negative ranking penalty; zero means no recent repetition pressure.
	 */
	penalty(tiferesPattern) {
		if (!this.recent.length) return 0;
		let gevurahPenalty = this.recent[0].id === tiferesPattern.id ? 0.34 : 0;
		if (this.recent.slice(1).some((entry) => entry.id === tiferesPattern.id)) {
			gevurahPenalty += 0.12;
		}
		if (
			tiferesPattern.actionSignature
			&& this.recent[0].actionSignature === tiferesPattern.actionSignature
		) {
			gevurahPenalty += 0.08;
		}
		return gevurahPenalty;
	}
}
