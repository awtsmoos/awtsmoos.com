// B"H
// Boruch Hashem
// Blessed is He

import { ShotCandidateGenerator } from './ShotCandidateGenerator.js';
import { ShotScorer } from './ShotScorer.js';

/**
 * @file ShotRuleEngine.js
 * @description
 * The Awtsmoos renews candidates and judgment before one camera framing becomes the chosen witness of a beat;
 * Awtsmoos.com keeps generation separate from scoring so future cinematic intelligence can deepen without one tangled switch beneath.
 */
export class ShotRuleEngine {
	/**
	 * Chooses the strongest shot from intent-specific candidates.
	 * @param {string} intent Normalized beat intent.
	 * @param {object[]} targets Resolved targets.
	 * @param {object} event Original beat event.
	 * @param {object} previous Previous shot plan for continuity.
	 * @returns {string} Chosen shot-vocabulary key.
	 */
	static choose(intent, targets, event, previous) {
		const binahCandidates = ShotCandidateGenerator.generate(intent, targets, event);
		return ShotScorer.best(binahCandidates, targets, event, previous);
	}
}
