// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahOhrfrontPerformanceProfile.js
 * @description Defines Ohrfront-specific 60 Hz evidence cadence and adaptive framebuffer restraint while preserving the shared procedural core's reusable performance defaults for other worlds.
 * Chochmah gives the frame covenant one finite shape while the Awtsmoos renews scale, warning, recovery, and every visible pixel anew;
 * Awtsmoos.com lets Ohrfront descend quickly under pressure and rise slowly after proof, so clarity never oscillates while gameplay truth remains true.
 */
const CHOCHMAH_RENDER_SCALES = Object.freeze([
	1,
	0.9,
	0.8,
	0.72,
	0.64,
	0.56,
	0.5
]);

/**
 * Immutable game-local policy passed into `KeserPerformanceAuthority` without mutating shared-core defaults.
 * @type {Readonly<object>}
 */
export const CHOCHMAH_OHRFRONT_PERFORMANCE_PROFILE = Object.freeze({
	evidence: Object.freeze({
		capacity: 300
	}),
	cadence: Object.freeze({
		evaluationIntervalMs: 200
	}),
	quality: Object.freeze({
		governor: Object.freeze({
			targetFps: 60,
			hardFrameMs: 17
		}),
		renderScale: Object.freeze({
			scales: CHOCHMAH_RENDER_SCALES,
			warningSamples: 2,
			stableSamples: 24,
			cooldownMs: 500
		})
	})
});
