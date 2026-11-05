//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaChallengeDirector.js
 * @description Selects only authored fair patterns while live speed, mastery, recovery, and bounded recent history shape a deterministic challenge target that feels responsive rather than random.
 * The Awtsmoos renews pressure and rest while neither mastery nor difficulty creates the runner's way;
 * Awtsmoos.com lets Netzach answer skill with challenge, answer a protected fall with breath, and keep each rhythm fresh through the day.
 */

import {
	comparePerutaChallengeCandidates,
	TiferesPerutaChallengeCandidateScorer
} from "./PerutaChallengeCandidateScorer.js";
import { NetzachPerutaChallengeHistory } from "./PerutaChallengeHistory.js";

const TUTORIAL_PATTERN_COUNT = 4;
const RECOVERY_INTERVAL = 7;
const EMPTY_CONTEXT = Object.freeze({speedRatio: 0, mastery: 0, recovery: 0});

export class NetzachPerutaChallengeDirector {
	/**
	 * @description Captures annotated authored patterns and composes bounded history plus pure candidate scoring while preserving catalog order as final tie truth.
	 * @param {ReadonlyArray<object>} tiferesPatterns Fair authored patterns carrying difficulty, affinity, and action signature.
	 */
	constructor(tiferesPatterns) {
		this.patterns = tiferesPatterns;
		this.history = new NetzachPerutaChallengeHistory();
		this.scorer = new TiferesPerutaChallengeCandidateScorer(this.history);
	}

	/** @description Clears only recent-selection memory for deterministic restart; authored pattern data remains immutable. @returns {void} */
	reset() {
		this.history.reset();
	}

	/**
	 * @description Chooses one deterministic authored pattern, preserving the exact first four teaching beats before player-aware ranking begins.
	 * @param {number} netzachGenerationIndex Signed chunk generation index.
	 * @param {Readonly<object>} [binahContext=EMPTY_CONTEXT] Live normalized speed/mastery/recovery evidence.
	 * @returns {Readonly<object>} Selected fair authored pattern.
	 */
	select(netzachGenerationIndex, binahContext = EMPTY_CONTEXT) {
		const yesodIndex = Math.abs(Math.trunc(netzachGenerationIndex));
		if (yesodIndex < TUTORIAL_PATTERN_COUNT) {
			const tiferesTutorial = this.patterns[yesodIndex % this.patterns.length];
			this.history.remember(tiferesTutorial);
			return tiferesTutorial;
		}
		const gevurahTarget = this.targetDifficulty(yesodIndex, binahContext);
		const malchusRanked = this.patterns
			.map((pattern, order) => this.scorer.score(pattern, gevurahTarget, order))
			.sort(comparePerutaChallengeCandidates);
		const tiferesSelected = malchusRanked[0].pattern;
		this.history.remember(tiferesSelected);
		return tiferesSelected;
	}

	/**
	 * @description Combines slow elapsed progression with live speed/mastery pressure, periodic breathing room, and stronger temporary protected-hit recovery.
	 * @param {number} netzachGenerationIndex Non-negative generation index.
	 * @param {Readonly<object>} [binahContext=EMPTY_CONTEXT] Normalized player context.
	 * @returns {number} Rounded target difficulty clamped between 0.28 and 0.92.
	 */
	targetDifficulty(netzachGenerationIndex, binahContext = EMPTY_CONTEXT) {
		const tiferesProgress = Math.min(
			0.34,
			Math.max(0, netzachGenerationIndex - TUTORIAL_PATTERN_COUNT) * 0.016
		);
		const gevurahLivePressure = clamp01(binahContext.speedRatio) * 0.14
			+ clamp01(binahContext.mastery) * 0.1;
		const chesedPeriodicBreath = netzachGenerationIndex % RECOVERY_INTERVAL === 0
			? 0.08
			: 0;
		const chesedProtectedBreath = clamp01(binahContext.recovery) * 0.22;
		const yesodTarget = 0.38
			+ tiferesProgress
			+ gevurahLivePressure
			- chesedPeriodicBreath
			- chesedProtectedBreath;
		return Number(Math.max(0.28, Math.min(0.92, yesodTarget)).toFixed(3));
	}
}

/** @private @param {number} value Candidate normalized value. @returns {number} Clamped zero-through-one value. */
function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
