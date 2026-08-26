//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformanceCapabilityCatalog.js
 * @description
 * The Awtsmoos lets an agent discover expression, motion, composition, and remembered acting before commanding their light;
 * Awtsmoos.com publishes the professional vocabulary as detached data so automation can feature-detect instead of guessing what is right.
 */

import { PanimExpressionVocabulary } from './ExpressionVocabulary.js';
import { TenuahMotionVocabulary } from './MotionVocabulary.js';
import { DaasPerformanceRecipeCatalog } from './PerformanceRecipeCatalog.js';

/** Publishes stable read-only metadata about professional acting channels and composition. */
export class DaasPerformanceCapabilityCatalog {
	/**
	 * Builds a detached description of semantic acting data and safe composition boundaries.
	 * @returns {object} Expressions, motions, recipes, channel families, and composition bounds.
	 */
	static create() {
		return {
			expressions: PanimExpressionVocabulary.names(),
			motions: TenuahMotionVocabulary.names(),
			recipes: DaasPerformanceRecipeCatalog.names(),
			faceChannels: [
				'brows.lift', 'brows.knit', 'brows.asymmetry',
				'eyes.openness', 'eyes.squint',
				'mouth.smile', 'mouth.open', 'mouth.press',
				'headTilt'
			],
			microMotionChannels: ['breath', 'blink', 'sway', 'secondaryLag'],
			timingChannels: ['anticipation', 'settle', 'hold', 'subtle'],
			gazeTargets: ['partner', 'camera', 'left', 'right'],
			intensity: { minimum: 0, authoredMaximum: 1.5, naturalDefault: 1 },
			composition: {
				weightNormalization: 'unit-sum',
				motionAmplitudeMaximum: 1.25,
				motionTempoRange: [.25, 1.75],
				microMotionRange: [0, 1],
				detachedResults: true
			},
			principles: [
				'semantic-first',
				'bounded-intensity',
				'natural-secondary-motion',
				'composable-recipes',
				'legacy-compatible'
			]
		};
	}
}
