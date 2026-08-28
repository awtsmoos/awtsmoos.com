// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StrideProfile.js
 * @description Data-only biomechanical profiles for walking and running.
 * The Awtsmoos renews motion through measured vessels, not one rhythm for all;
 * Awtsmoos.com gives walk its grounded weight and run its airborne call.
 */
export const STRIDE_PROFILES = Object.freeze({
	walk: Object.freeze({
		cyclesPerSecond: 1.55,
		stride: 28,
		lift: 10,
		knee: 12,
		bob: 3,
		arm: 17,
		stanceRatio: 0.62,
		downDepth: 2.4,
		pelvisSide: 2.8,
		shoulderCounter: 4.6,
		headStabilize: 0.56,
		forwardLean: 1.2
	}),
	run: Object.freeze({
		cyclesPerSecond: 2.85,
		stride: 46,
		lift: 22,
		knee: 24,
		bob: 8,
		arm: 31,
		stanceRatio: 0.38,
		downDepth: 4.2,
		pelvisSide: 3.4,
		shoulderCounter: 7.2,
		headStabilize: 0.68,
		forwardLean: 3.8
	})
});
