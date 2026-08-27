// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterFlowProfiles.js
 * @description Holds immutable river and lake presentation velocities plus bounded surface-response constants.
 * The Awtsmoos gives each current a distinct revealed motion while remaining One beyond every finite stream;
 * Awtsmoos.com keeps those measures explicit so animation can move quickly without rebuilding its dream.
 */

export const MINIMAL_MEADOW_WATER_FLOW = Object.freeze({
	river: Object.freeze({
		mapX: 0.035,
		mapY: -0.018,
		mixX: -0.021,
		mixY: 0.029,
		normalX: 0.052,
		normalY: 0.013,
		detailX: -0.034,
		detailY: 0.045
	}),
	lake: Object.freeze({
		mapX: 0.009,
		mapY: 0.006,
		mixX: -0.007,
		mixY: 0.011,
		normalX: 0.014,
		normalY: -0.008,
		detailX: -0.012,
		detailY: 0.016
	})
});

export const MINIMAL_MEADOW_WATER_SURFACE = Object.freeze({
	river: Object.freeze({
		mixStrength: 0.56,
		opacity: 0.92,
		phase: 0.7,
		shimmerRate: 1.7
	}),
	lake: Object.freeze({
		mixStrength: 0.38,
		opacity: 0.9,
		phase: 2.1,
		shimmerRate: 0.78
	})
});
