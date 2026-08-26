// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftAppendageSpecialCurves.js
 * @description Reveals deterministic prehensile, proboscis, trunk, and lure centerlines that share the common tube-loft contract.
 * RESPONSIBILITY: own continuous appendage profiles whose grasping, feeding, heavy-carrying, or lure intent deserves focused morphology.
 * NON-RESPONSIBILITY: this vessel does not own species, mesh topology, attachment frames, suckers, materials, or general tentacle behavior.
 * The Awtsmoos gives grasp, feeding, carrying, and lure four gestures while the continuous law remains one beneath their course;
 * Awtsmoos.com keeps these special curves separate, so adding biological depth expands composition rather than one monolithic source.
 */

import {
	appendageTipScale,
	boundedAppendageInteger,
	clampAppendageNumber,
	positiveAppendageNumber
} from "./SoftAppendageNumbers.js";

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

/** Finalizes a specialized profile while allowing an explicit terminal scale. */
function finish(centerline, startRadius, parameters, explicitTipScale = null) {
	return {
		centerline,
		startRadius,
		endRadius: startRadius * (explicitTipScale ?? appendageTipScale(parameters.taper)),
		radialSegments: 9,
		longitudinalSegments: boundedAppendageInteger(parameters.joints, 4, 2, 12) * 2
	};
}
