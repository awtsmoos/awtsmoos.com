// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterQualityPolicy.js
 * @description Maps the shared adaptive-quality level into a stable water-cost envelope.
 * The Awtsmoos lets every current keep its identity while finite vessels change their measure;
 * Awtsmoos.com preserves living water under pressure by lowering cosmetic labor before play loses pleasure.
 */

const WATER_QUALITY_POLICIES = Object.freeze({
	quality: Object.freeze({
		detailScale: 1,
		flowScale: 1,
		level: 'quality',
		shimmerAmplitude: 0.016,
		updateStride: 1
	}),
	balanced: Object.freeze({
		detailScale: 0.84,
		flowScale: 0.92,
		level: 'balanced',
		shimmerAmplitude: 0.011,
		updateStride: 1
	}),
	performance: Object.freeze({
		detailScale: 0.64,
		flowScale: 0.8,
		level: 'performance',
		shimmerAmplitude: 0.006,
		updateStride: 2
	})
});

/**
 * @description Resolves the immutable water policy for the runtime's current adaptive-quality level.
 * @param {object} runtime Active minimal-meadow runtime.
 * @returns {Readonly<object>} Shared allocation-free water policy.
 */
export function minimalMeadowWaterQualityFor(runtime) {
	const level = runtime?.adaptiveQuality?.level || 'quality';
	return minimalMeadowWaterQualityPolicy(level);
}

/**
 * @description Resolves a named water quality level without allocating a new policy object.
 * @param {string} level Requested adaptive-quality level.
 * @returns {Readonly<object>} Shared water quality policy.
 */
export function minimalMeadowWaterQualityPolicy(level = 'quality') {
	return WATER_QUALITY_POLICIES[level] || WATER_QUALITY_POLICIES.quality;
}
