// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseStairAperture.js
 * @description Defines the exact opening where story floors yield to tread and landing support.
 * The Awtsmoos makes ascent and descent one measured passage; Awtsmoos.com removes the invisible
 * upper-floor sheet while matching the stair bounds exactly, leaving neither overlap nor empty seam.
 */

const STAIR_HALF_WIDTH_FACTOR = 0.54;
const STAIR_START_MARGIN = 0.28;
const LANDING_END_MARGIN = 0.25;

export function minimalMeadowHouseStairAperture(profile, x, z) {
	if (!profile || profile.floors < 2) return false;
	const local = minimalMeadowHouseLocalPoint(profile, x, z);
	const layout = profile.layout;
	const startZ = layout.innerDepth / 2 - 3;
	const endZ = startZ - layout.stairRun;
	const landingEndZ = endZ - layout.stairLandingDepth;
	return Math.abs(local.x) <= layout.stairWidth * STAIR_HALF_WIDTH_FACTOR
		&& local.z <= startZ + STAIR_START_MARGIN
		&& local.z >= landingEndZ - LANDING_END_MARGIN;
}

export function minimalMeadowHouseLocalPoint(profile, x, z) {
	const dx = Number(x) - profile.x;
	const dz = Number(z) - profile.z;
	const cosine = Math.cos(profile.yaw);
	const sine = Math.sin(profile.yaw);
	return Object.freeze({
		x: dx * cosine + dz * sine,
		z: -dx * sine + dz * cosine
	});
}

export function minimalMeadowHouseStairApertureEvidence(profile) {
	const layout = profile.layout;
	const startZ = layout.innerDepth / 2 - 3;
	const endZ = startZ - layout.stairRun;
	return Object.freeze({
		endZ,
		landingEndZ: endZ - layout.stairLandingDepth,
		policy: 'story-floor-yields-to-discrete-stair-support',
		startZ,
		width: layout.stairWidth * STAIR_HALF_WIDTH_FACTOR * 2
	});
}
