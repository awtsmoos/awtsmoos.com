// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftAppendageProfile.js
 * @description Normalizes continuous soft-appendage morphology and reveals deterministic centerlines for recipe-specific directional intent.
 * RESPONSIBILITY: turn hanging-tube or flexible-tube parameters into one bounded geometric profile without constructing mesh topology.
 * NON-RESPONSIBILITY: this vessel does not own turkey, fish, barbel, snood, rig simulation, attachment resolution, materials, or renderer objects.
 * The Awtsmoos lets one measured curve hang as snood or reach as barbel without species possessing the law;
 * Awtsmoos.com keeps semantic recipes distinct while a shared continuous profile reveals the geometry they truly draw.
 */

const HANGING_RECIPE = "hanging-soft-tube";

/**
 * Creates a bounded profile for one continuous soft appendage.
 * @param {object} [parameters={}] Normalized Briah parameters including biological geometry recipe.
 * @returns {object} Centerline, radii, and bounded loft segment counts.
 */
export function createSoftAppendageProfile(parameters = {}) {
	const recipe = String(parameters.biologicalGeometryRecipe || "flexible-tapered-tube");
	return recipe === HANGING_RECIPE
		? createHangingProfile(parameters)
		: createFlexibleProfile(parameters);
}

/** Builds a primarily downward profile suitable for hanging soft tissue. */
function createHangingProfile(parameters) {
	const length = positive(parameters.length, 0.16);
	const width = positive(parameters.width, 0.035);
	const curl = clamp(parameters.curl, -1, 1, 0.18);
	const engorgement = clamp(parameters.engorgement, 0, 1, 0.45);
	const startRadius = width * 0.5 * (1 + engorgement * 0.4);
	return profile({
		centerline: [
			[0, 0, 0],
			[curl * length * 0.04, -length * 0.3, curl * length * 0.02],
			[curl * length * 0.12, -length * 0.68, curl * length * 0.07],
			[curl * length * 0.2, -length, curl * length * 0.12]
		],
		startRadius,
		taper: parameters.taper,
		joints: parameters.joints
	});
}

/** Builds an outward profile that bends downward like a flexible sensory barbel. */
function createFlexibleProfile(parameters) {
	const length = positive(parameters.length, 0.16);
	const startRadius = positive(parameters.radius, 0.008);
	const droop = clamp(parameters.droop, 0, 1, 0.12);
	const curl = clamp(parameters.curl ?? parameters.curvature, -1, 1, 0);
	return profile({
		centerline: [
			[0, 0, 0],
			[curl * length * 0.03, -droop * length * 0.08, length * 0.32],
			[curl * length * 0.09, -droop * length * 0.36, length * 0.67],
			[curl * length * 0.15, -droop * length, length]
		],
		startRadius,
		taper: parameters.taper,
		joints: parameters.joints
	});
}

/** Converts common morphology into one topology-safe loft profile. */
function profile({ centerline, startRadius, taper, joints }) {
	const taperStrength = clamp(taper, 0, 1, 0.82);
	const tipScale = Math.max(0.08, 1 - taperStrength * 0.82);
	const jointCount = boundedInteger(joints, 4, 2, 8);
	return {
		centerline,
		startRadius,
		endRadius: startRadius * tipScale,
		radialSegments: 9,
		longitudinalSegments: jointCount * 2
	};
}

/** Returns one positive finite scalar or a safe fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Clamps one finite scalar to a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	const finiteValue = Number.isFinite(number) ? number : fallback;
	return Math.max(minimum, Math.min(maximum, finiteValue));
}

/** Bounds one topology hint so malformed input cannot explode geometry. */
function boundedInteger(value, fallback, minimum, maximum) {
	const number = Math.round(Number(value));
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}
