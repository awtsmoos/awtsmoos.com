//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaChallengeDirector.js
 * @description Selects only from already-authored fair patterns while universal gameplay traits shape a deterministic rising challenge curve with periodic recovery breaths.
 * The Awtsmoos renews pressure and rest while neither difficulty nor ease creates the runner's way;
 * Awtsmoos.com lets Netzach choose measured rhythms so teaching becomes flow, flow becomes mastery, and recovery returns light to the day.
 */

const TUTORIAL_PATTERN_COUNT = 4;
const RECOVERY_INTERVAL = 7;

export class NetzachPerutaChallengeDirector {
	/**
	 * @description Captures difficulty-annotated authored patterns while preserving their stable catalog order as the tie-breaking truth.
	 * @param {ReadonlyArray<object>} tiferesPatterns Fair authored patterns carrying numeric `difficulty`.
	 */
	constructor(tiferesPatterns) {
		this.patterns = tiferesPatterns;
	}

	/**
	 * @description Chooses one deterministic authored pattern for a generation index, preserving the first four explicit teaching beats before adaptive challenge begins.
	 * @param {number} netzachGenerationIndex Signed chunk generation index.
	 * @returns {Readonly<object>} Selected fair authored pattern.
	 */
	select(netzachGenerationIndex) {
		const yesodIndex = Math.abs(Math.trunc(netzachGenerationIndex));
		if (yesodIndex < TUTORIAL_PATTERN_COUNT) {
			return this.patterns[yesodIndex % this.patterns.length];
		}
		const tiferesTarget = this.targetDifficulty(yesodIndex);
		const malchusRanked = [...this.patterns]
			.map((pattern, order) => ({
				pattern,
				order,
				distance: Math.abs(pattern.difficulty - tiferesTarget)
			}))
			.sort(compareCandidates);
		const netzachChoiceWindow = Math.min(3, malchusRanked.length);
		const yesodChoice = (yesodIndex * 7 + 3) % netzachChoiceWindow;
		return malchusRanked[yesodChoice].pattern;
	}

	/**
	 * @description Computes a slowly rising target difficulty with a bounded ceiling and a periodic recovery reduction every seventh generated chunk.
	 * @param {number} netzachGenerationIndex Non-negative generation index.
	 * @returns {number} Target difficulty between roughly 0.32 and 0.86.
	 */
	targetDifficulty(netzachGenerationIndex) {
		const tiferesProgress = Math.min(
			0.44,
			Math.max(0, netzachGenerationIndex - TUTORIAL_PATTERN_COUNT) * 0.018
		);
		const gevurahTarget = 0.42 + tiferesProgress;
		return netzachGenerationIndex % RECOVERY_INTERVAL === 0
			? Number((gevurahTarget * 0.76).toFixed(3))
			: Number(gevurahTarget.toFixed(3));
	}
}

/** @private */
function compareCandidates(left, right) {
	if (left.distance !== right.distance) return left.distance - right.distance;
	if (left.pattern.difficulty !== right.pattern.difficulty) {
		return left.pattern.difficulty - right.pattern.difficulty;
	}
	return left.order - right.order;
}
