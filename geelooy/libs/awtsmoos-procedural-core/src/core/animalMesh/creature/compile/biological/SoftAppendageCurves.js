// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftAppendageCurves.js
 * @description Reveals deterministic centerlines for hanging, flexible, tentacular, prehensile, proboscis, trunk, and lure appendages.
 * RESPONSIBILITY: map semantic morphology into bounded local curves and radii while preserving one canonical tube-loft contract.
 * NON-RESPONSIBILITY: this file does not build meshes, resolve frames, simulate motion, own species, or attach suckers.
 * The Awtsmoos bends one continuous line into many living gestures without dividing the law beneath their name;
 * Awtsmoos.com lets snood, barbel, tentacle, trunk, and lure share a loft while each semantic curve keeps its flame.
 */

import {
	appendageTipScale,
	boundedAppendageInteger,
	clampAppendageNumber,
	positiveAppendageNumber
} from "./SoftAppendageNumbers.js";

/** Preserves the original hanging-snood profile exactly while moving ownership into a focused curve module. */
export function createHangingSoftCurve(parameters) {
	const length = positiveAppendageNumber(parameters.length, 0.16);
	const width = positiveAppendageNumber(parameters.width, 0.035);
	const curl = clampAppendageNumber(parameters.curl, -1, 1, 0.18);
	const engorgement = clampAppendageNumber(parameters.engorgement, 0, 1, 0.45);
	return finish([
		[0, 0, 0],
		[curl * length * 0.04, -length * 0.3, curl * length * 0.02],
		[curl * length * 0.12, -length * 0.68, curl * length * 0.07],
		[curl * length * 0.2, -length, curl * length * 0.12]
	], width * 0.5 * (1 + engorgement * 0.4), parameters);
}

/** Preserves the original barbel profile exactly while making it reusable by the larger appendage grammar. */
export function createFlexibleTaperedCurve(parameters) {
	const length = positiveAppendageNumber(parameters.length, 0.16);
	const radius = positiveAppendageNumber(parameters.radius, 0.008);
	const droop = clampAppendageNumber(parameters.droop, 0, 1, 0.12);
	const curl = clampAppendageNumber(parameters.curl ?? parameters.curvature, -1, 1, 0);
	return finish([
		[0, 0, 0],
		[curl * length * 0.03, -droop * length * 0.08, length * 0.32],
		[curl * length * 0.09, -droop * length * 0.36, length * 0.67],
		[curl * length * 0.15, -droop * length, length]
	], radius, parameters);
}

/** Builds a sinuous tentacle centerline with bounded curl, undulation, and droop. */
export function createTentacleCurve(parameters) {
	const length = positiveAppendageNumber(parameters.length, 0.52);
	const radius = positiveAppendageNumber(parameters.radius, 0.035);
	const curl = clampAppendageNumber(parameters.curl, -1, 1, 0.28);
	const wave = clampAppendageNumber(parameters.undulation, 0, 1, 0.22);
	const droop = clampAppendageNumber(parameters.droop, 0, 1, 0.16);
	return finish([
		[0, 0, 0],
		[length * wave * 0.08, -length * droop * 0.05, length * 0.22],
		[-length * wave * 0.1, -length * droop * 0.2, length * 0.48],
		[length * curl * 0.16, -length * droop * 0.55, length * 0.76],
		[length * curl * 0.3, -length * droop, length]
	], radius, parameters);
}

/** Builds a curling prehensile path suitable for tails, tendrils, trunks, and fantasy graspers. */
export function createPrehensileCurve(parameters) {
	const length = positiveAppendageNumber(parameters.length, 0.65);
	const radius = positiveAppendageNumber(parameters.radius, 0.035);
	const curl = clampAppendageNumber(parameters.curl, -1, 1, 0.52);
	const coil = clampAppendageNumber(parameters.coil, 0, 1, 0.3);
	return finish([
		[0, 0, 0],
		[length * curl * 0.04, 0, length * 0.24],
		[length * curl * 0.16, -length * coil * 0.1, length * 0.5],
		[length * curl * 0.32, -length * coil * 0.35, length * 0.76],
		[length * curl * (0.42 - coil * 0.18), -length * coil * 0.7, length]
	], radius, parameters);
}

/** Builds a forward projecting proboscis path with a controlled terminal flare. */
export function createProboscisCurve(parameters) {
	const length = positiveAppendageNumber(parameters.length, 0.4);
	const radius = positiveAppendageNumber(parameters.radius, 0.03);
	const curve = clampAppendageNumber(parameters.curve, -1, 1, 0.18);
	return finish([
		[0, 0, 0],
		[curve * length * 0.04, 0, length * 0.3],
		[curve * length * 0.12, -Math.abs(curve) * length * 0.05, length * 0.66],
		[curve * length * 0.2, -Math.abs(curve) * length * 0.12, length]
	], radius, parameters, clampAppendageNumber(parameters.tipScale, 0.25, 1.6, 0.72));
}

/** Builds a heavier trunk path with gradual droop and a broad controllable tip. */
export function createTrunkCurve(parameters) {
	const length = positiveAppendageNumber(parameters.length, 0.72);
	const radius = positiveAppendageNumber(parameters.radius, 0.09);
	const curl = clampAppendageNumber(parameters.curl, -1, 1, 0.12);
	const droop = clampAppendageNumber(parameters.droop, 0, 1, 0.28);
	return finish([
		[0, 0, 0],
		[curl * length * 0.04, -droop * length * 0.05, length * 0.24],
		[curl * length * 0.12, -droop * length * 0.25, length * 0.52],
		[curl * length * 0.2, -droop * length * 0.6, length * 0.78],
		[curl * length * 0.24, -droop * length, length]
	], radius, parameters, clampAppendageNumber(parameters.tipScale, 0.2, 1, 0.46));
}

/** Builds a thin angler-style lure stalk with a widened terminal profile. */
export function createLureCurve(parameters) {
	const length = positiveAppendageNumber(parameters.length, 0.3);
	const radius = positiveAppendageNumber(parameters.radius, 0.012);
	const curve = clampAppendageNumber(parameters.curve, -1, 1, 0.2);
	return finish([
		[0, 0, 0],
		[curve * length * 0.06, 0, length * 0.34],
		[curve * length * 0.16, -Math.abs(curve) * length * 0.04, length * 0.7],
		[curve * length * 0.24, -Math.abs(curve) * length * 0.08, length]
	], radius, parameters, clampAppendageNumber(parameters.tipScale, 0.8, 2.4, 1.7));
}

/** Finalizes the shared smooth-loft contract with bounded topology. */
function finish(centerline, startRadius, parameters, explicitTipScale = null) {
	return {
		centerline,
		startRadius,
		endRadius: startRadius * (explicitTipScale ?? appendageTipScale(parameters.taper)),
		radialSegments: 9,
		longitudinalSegments: boundedAppendageInteger(parameters.joints, 4, 2, 12) * 2
	};
}
