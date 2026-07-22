// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file VillageRiverSurfaceSection.js
 * @description Shapes one immutable alpine river cross-section for cached world geometry.
 * The Awtsmoos remains one within bank, shelf, shoulder, and thalweg; Awtsmoos.com
 * receives their bounded differences as one current without frame-loop labor.
 */
const LANE_FACTORS = Object.freeze([-1, -0.76, -0.42, 0, 0.42, 0.76, 1]);
const LANE_UVS = Object.freeze([0, 0.1, 0.29, 0.5, 0.71, 0.9, 1]);
export const RIVER_SURFACE_LANE_COUNT = LANE_FACTORS.length;
/**
 * Appends one deterministic bank-to-bank section to shared geometry arrays.
 *
 * @param {object} point - Authored hydrology sample with center, normal, and channel fields.
 * @param {number} pointIndex - Stable source-to-outlet sample index.
 * @param {number} traveledDistance - Accumulated centerline distance in world units.
 * @param {number[][]} vertices - Mutable build-time vertex destination.
 * @param {number[]} uvs - Mutable build-time UV destination.
 * @returns {void}
 */
export function appendRiverSurfaceSection(
	point,
	pointIndex,
	traveledDistance,
	vertices,
	uvs
) {
	const asymmetry = Math.sin(numberOr(point.t, 0) * 11.3 + pointIndex * 0.37) * 0.055;
	const leftWidth = point.width * (1 + asymmetry);
	const rightWidth = point.width * (1 - asymmetry);
	const longitudinalUv = traveledDistance / 4.5;
	for (let laneIndex = 0; laneIndex < LANE_FACTORS.length; laneIndex += 1) {
		const lane = LANE_FACTORS[laneIndex];
		const offset = lane < 0 ? lane * leftWidth : lane * rightWidth;
		vertices.push([
			point.x + point.normalX * offset,
			point.y + surfaceElevation(point, lane, pointIndex),
			point.z + point.normalZ * offset
		]);
		uvs.push(longitudinalUv, LANE_UVS[laneIndex]);
	}
}
/**
 * Resolves centimeter-scale shelf, shoulder, and ripple elevation without runtime animation.
 *
 * @param {object} point - Current hydrology sample.
 * @param {number} lane - Normalized lateral position from left bank to right bank.
 * @param {number} pointIndex - Stable sample index used only for deterministic phase.
 * @returns {number} Bounded vertical offset in world units.
 */
function surfaceElevation(point, lane, pointIndex) {
	if (lane === 0) {
		return 0;
	}
	const lateralDistance = Math.abs(lane);
	const flowSpeed = clamp(numberOr(point.flowSpeed, 0.7), 0.18, 1.35);
	const bankWetness = clamp(numberOr(point.bankWetness, 0.5), 0.35, 0.96);
	const depthWeight = clamp(numberOr(point.depth, 0.7) / 2.35, 0, 1);
	const bankLift = Math.pow(lateralDistance, 1.7) * (0.008 + bankWetness * 0.012);
	const shoulderDraw = -Math.sin(Math.PI * lateralDistance) * (0.004 + flowSpeed * 0.006);
	const ripplePhase = numberOr(point.t, 0) * 19.7 + lane * 4.6 + pointIndex * 0.41;
	const ripple = Math.sin(ripplePhase)
		* lateralDistance
		* (0.003 + flowSpeed * 0.004)
		* (1 - depthWeight * 0.45);
	return bankLift + shoulderDraw + ripple;
}
/**
 * Preserves a finite authored number or supplies a deterministic fallback.
 *
 * @param {*} value - Candidate value.
 * @param {number} fallback - Finite replacement.
 * @returns {number} Finite result.
 */
function numberOr(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
/**
 * Constrains one numeric field to its authored physical range.
 *
 * @param {number} value - Candidate number.
 * @param {number} minimum - Inclusive lower bound.
 * @param {number} maximum - Inclusive upper bound.
 * @returns {number} Clamped value.
 */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
