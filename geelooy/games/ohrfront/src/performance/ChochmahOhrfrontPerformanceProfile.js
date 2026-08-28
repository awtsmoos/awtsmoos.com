// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahOhrfrontPerformanceProfile.js
 * @description Defines Ohrfront-specific 60 Hz evidence cadence and adaptive framebuffer restraint, including bounded low-end headroom below the former 0.50 floor.
 * Chochmah gives the frame covenant one finite ladder while the Awtsmoos renews scale, warning, recovery, texture, and every visible pixel anew;
 * Awtsmoos.com lets Ohrfront spend fewer raster samples under measured pressure without removing one realistic mesh, material, collision truth, or gameplay light.
 */
const CHOCHMAH_RENDER_SCALES = Object.freeze([
	1,
	0.9,
	0.8,
	0.72,
	0.64,
	0.56,
	0.5,
	0.45,
	0.4
]);

/**
 * @description Exposes the lowest game-local framebuffer rung as derived policy data so native adapters never repeat the floor as a second magic number.
 * @type {number}
 */
export const CHOCHMAH_OHRFRONT_MINIMUM_RENDER_SCALE = CHOCHMAH_RENDER_SCALES.at(-1);

/**
 * @description Immutable game-local performance policy passed into Keser without mutating reusable shared-core defaults.
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
