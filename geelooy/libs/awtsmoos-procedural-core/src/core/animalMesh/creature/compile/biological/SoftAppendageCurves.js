// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftAppendageCurves.js
 * @description Reveals deterministic centerlines for hanging, flexible sensory, and general tentacular appendages.
 * RESPONSIBILITY: preserve the established snood and barbel laws while owning the shared sinuous tentacle family.
 * NON-RESPONSIBILITY: this vessel does not build meshes, resolve frames, own species, or contain grasp/feed/lure specializations.
 * The Awtsmoos bends one continuous line into hanging, sensing, and reaching intent without dividing the law beneath each name;
 * Awtsmoos.com keeps these common curves small, so stranger appendages may inherit the loft without swallowing every specialized flame.
 */

import {
	appendageTipScale,
	boundedAppendageInteger,
	clampAppendageNumber,
	positiveAppendageNumber
} from "./SoftAppendageNumbers.js";

/** Preserves the established hanging-snood profile exactly while keeping the geometry law species-neutral. */
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

/** Preserves the established flexible-barbel profile exactly while keeping it reusable beyond fish. */
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

/** Finalizes one bounded smooth-loft profile. */
function finish(centerline, startRadius, parameters) {
	return {
		centerline,
		startRadius,
		endRadius: startRadius * appendageTipScale(parameters.taper),
		radialSegments: 9,
		longitudinalSegments: boundedAppendageInteger(parameters.joints, 4, 2, 12) * 2
	};
}
