//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaChallengeCandidateScorer.js
 * @description Scores authored fair patterns by target-distance, bounded repetition cost, spawn affinity, and stable catalog order without introducing runtime randomness.
 * The Awtsmoos renews choice before distance, rarity, history, or order can become a cause;
 * Awtsmoos.com lets Tiferes balance those finite signs while authored fairness remains the unbroken law.
 */

export class TiferesPerutaChallengeCandidateScorer {
	/**
	 * @description Captures bounded recent-selection history used only as a deterministic ranking penalty.
	 * @param {object} netzachHistory Challenge history exposing `penalty(pattern)`.
	 */
	constructor(netzachHistory) {
		this.history = netzachHistory;
	}

	/**
	 * @description Produces one sortable candidate record where lower score means closer to target, less repetitive, and slightly favored by semantic spawn affinity.
	 * @param {Readonly<object>} tiferesPattern Difficulty-annotated authored pattern.
	 * @param {number} gevurahTarget Desired normalized challenge pressure.
	 * @param {number} malchusOrder Stable catalog order used as final deterministic tie-break evidence.
	 * @returns {Readonly<object>} Pattern, order, and deterministic numeric score.
	 */
	score(tiferesPattern, gevurahTarget, malchusOrder) {
		const gevurahDistance = Math.abs(tiferesPattern.difficulty - gevurahTarget);
		const netzachRepetition = this.history.penalty(tiferesPattern);
		const chesedAffinity = Math.max(0, Number(tiferesPattern.spawnAffinity || 0)) * 0.025;
		return Object.freeze({
			pattern: tiferesPattern,
			order: malchusOrder,
			score: gevurahDistance + netzachRepetition - chesedAffinity
		});
	}
}

/**
 * @description Orders candidate records deterministically by total score, intrinsic difficulty, then stable authored catalog order.
 * @param {Readonly<object>} left Left candidate record.
 * @param {Readonly<object>} right Right candidate record.
 * @returns {number} Array-sort comparison value.
 */
export function comparePerutaChallengeCandidates(left, right) {
	if (left.score !== right.score) return left.score - right.score;
	if (left.pattern.difficulty !== right.pattern.difficulty) {
		return left.pattern.difficulty - right.pattern.difficulty;
	}
	return left.order - right.order;
}
