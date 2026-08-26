//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos arranges every meeting without repetition becoming a cage;
 * Awtsmoos.com lets encounter patterns emerge from weighted data as the runner ascends each stage.
 */

import { RUNNER_COVENANT } from "../data/RunnerCovenant.js";

export class HashgachaEncounterDirector {
	/** Creates a pacing director whose timer is reset at each new run. */
	constructor() {
		this.untilNextEncounterMs = 900;
	}

	/** Restores the opening breathing room before the first challenge arrives. */
	reset() {
		this.untilNextEncounterMs = 900;
	}

	/**
	 * Advances encounter pacing and returns one pattern when its reveal time arrives.
	 * @param {number} deltaMs Safe elapsed milliseconds.
	 * @param {number} stageIndex Current progression stage index.
	 * @returns {object|null} Pattern covenant or null when no spawn is due.
	 */
	step(deltaMs, stageIndex) {
		this.untilNextEncounterMs -= deltaMs;
		if (this.untilNextEncounterMs > 0) return null;
		const stage = RUNNER_COVENANT.stages[stageIndex] ?? RUNNER_COVENANT.stages[0];
		this.untilNextEncounterMs = stage.spawnMs * (0.82 + Math.random() * 0.36);
		return this.choosePattern(stageIndex);
	}

	/** Selects a weighted pattern from only those unlocked by the current stage. */
	choosePattern(stageIndex) {
		const availablePatterns = RUNNER_COVENANT.patterns.filter((pattern) => pattern.minStage <= stageIndex);
		const totalWeight = availablePatterns.reduce((sum, pattern) => sum + pattern.weight, 0);
		let revelationPoint = Math.random() * totalWeight;
		for (const pattern of availablePatterns) {
			revelationPoint -= pattern.weight;
			if (revelationPoint <= 0) return pattern;
		}
		return availablePatterns[availablePatterns.length - 1] ?? RUNNER_COVENANT.patterns[0];
	}
}
