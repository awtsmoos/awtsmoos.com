//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorldParticleBudgetPolicy.js
 * @description Defines the finite vessels that keep world particles expressive
 * without stealing the frame. The Awtsmoos may be revealed through mist, dust,
 * pollen, and light; Awtsmoos.com lets critical feedback remain while distant
 * ornament yields first when a smaller vessel must carry the same living world.
 */

export const WORLD_PARTICLE_IMPORTANCE = Object.freeze({
	AMBIENT: 'ambient',
	CRITICAL: 'critical',
	DISTANT: 'distant',
	NEARBY: 'nearby'
});

const QUALITY_PROFILES = Object.freeze({
	cinematic: profile(360, 1, 1, 1, 1),
	high: profile(300, 1, 1, 1, 1),
	medium: profile(210, 1, 0.85, 0.65, 0.45),
	low: profile(140, 0.9, 0.65, 0.4, 0.2),
	minimal: profile(80, 0.8, 0.5, 0.25, 0)
});

/**
 * @description Resolves immutable particle limits for quality and motion preference.
 * @param {string} quality Requested world quality tier.
 * @param {boolean} reducedMotion Whether motion reduction is requested.
 * @returns {{totalCap:number, scales:Readonly<object>}} Effective particle budget.
 */
export function worldParticleBudgetProfile(quality = 'high', reducedMotion = false) {
	const selected = QUALITY_PROFILES[quality] || QUALITY_PROFILES.high;
	if (!reducedMotion) {
		return selected;
	}
	return Object.freeze({
		scales: Object.freeze({
			ambient: Math.min(selected.scales.ambient, 0.25),
			critical: Math.min(selected.scales.critical, 0.9),
			distant: 0,
			nearby: Math.min(selected.scales.nearby, 0.55)
		}),
		totalCap: Math.min(selected.totalCap, 96)
	});
}

/**
 * @description Creates one immutable quality budget profile.
 * @param {number} totalCap Maximum active particles represented by the policy.
 * @param {number} critical Critical gameplay scale.
 * @param {number} nearby Nearby environmental scale.
 * @param {number} ambient Ambient environmental scale.
 * @param {number} distant Distant cosmetic scale.
 * @returns {{totalCap:number, scales:Readonly<object>}} Frozen profile.
 */
function profile(totalCap, critical, nearby, ambient, distant) {
	return Object.freeze({
		scales: Object.freeze({ ambient, critical, distant, nearby }),
		totalCap
	});
}
