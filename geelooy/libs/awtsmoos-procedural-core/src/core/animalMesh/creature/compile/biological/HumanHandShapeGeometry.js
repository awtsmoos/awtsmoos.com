// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HumanHandShapeGeometry.js
 * @description Builds a specifically human palm, four fingers, and side-aware opposable thumb in local coordinates.
 * RESPONSIBILITY: own the static Medabeir hand shape while leaving Yesod transport, rig controls, animation, and materials elsewhere.
 * NON-RESPONSIBILITY: this file does not place hands on bodies, solve IK, create nails, or define human archetypes.
 * The Awtsmoos lets five digits become one hand of action while thumb and finger each retain their measured part;
 * Awtsmoos.com reveals that local human form as a reusable keli, ready for creature, wall, or stranger art.
 */

import { buildEllipsoidFromCommand, buildTubeFromCommand } from "../../../geometry/primitiveBuilder.js";
import { joinMeshParts } from "../../../geometry/joinMeshParts.js";

/**
 * Builds one five-digit human hand in local coordinates.
 * @param {object} parameters Palm, side metadata, finger ratios, and thumb-opposition controls.
 * @returns {object} Joined renderer-neutral hand geometry.
 */
export function createHumanHandShapeGeometry(parameters = {}) {
	const palm = normalizedPalm(parameters.palm);
	const side = parameters.biologicalMetadata?.side === "right" ? 1 : -1;
	const ratios = normalizedFingerLengths(parameters.fingerLengths);
	const opposition = clamp(parameters.thumbOpposition, 0, 1, 0.74);
	return joinMeshParts([
		{
			id: "palm",
			...buildPalm(palm)
		},
		createThumb(side, palm, ratios[0], opposition),
		...createFingers(palm, ratios)
	]);
}

/** Creates the opposable thumb at the lateral palm edge. */
function createThumb(side, palm, ratio, opposition) {
	const start = [side * palm[0] * 0.46, -palm[1] * 0.08, 0];
	const length = palm[1] * ratio * 0.58;
	const end = [
		start[0] + side * length * (0.58 + opposition * 0.22),
		start[1] + length * 0.46,
		palm[2] * opposition * 0.3
	];
	return digitTube("thumb", start, end, palm[0] * 0.11);
}

/** Creates index, middle, ring, and little fingers with human length ratios. */
function createFingers(palm, ratios) {
	const names = ["index", "middle", "ring", "little"];
	return names.map((name, index) => {
		const centered = index - 1.5;
		const x = centered * palm[0] * 0.22;
		const start = [x, palm[1] * 0.42, 0];
		const length = palm[1] * ratios[index + 1] * 0.78;
		const end = [x, start[1] + length, palm[2] * 0.08];
		return digitTube(
			name,
			start,
			end,
			palm[0] * (0.09 - index * 0.006)
		);
	});
}

/** Builds one tapered digit tube with bounded smoothness. */
function digitTube(id, start, end, radius) {
	return {
		id,
		...buildTubeFromCommand({
			args: {
				start,
				end,
				start_radius: radius,
				end_radius: radius * 0.72,
				radial_segments: 7,
				longitudinal_segments: 5
			}
		})
	};
}

/** Builds the smooth palm volume. */
function buildPalm(palm) {
	return buildEllipsoidFromCommand({
		args: {
			center: [0, 0, 0],
			radii: [palm[0] * 0.5, palm[1] * 0.5, palm[2] * 0.5],
			vertical_segments: 10,
			radial_segments: 14
		}
	});
}

/** Normalizes palm dimensions from the semantic definition. */
function normalizedPalm(value) {
	const fallback = [0.095, 0.105, 0.032];
	return fallback.map((defaultValue, index) => {
		const number = Number(value?.[index]);
		return Number.isFinite(number) && number > 0 ? number : defaultValue;
	});
}

/** Normalizes the five human digit-length ratios. */
function normalizedFingerLengths(value) {
	const fallback = [0.72, 1, 1.07, 0.98, 0.78];
	return fallback.map((defaultValue, index) => {
		const number = Number(value?.[index]);
		return Number.isFinite(number) && number > 0 ? number : defaultValue;
	});
}

/** Clamps one finite value into a closed interval. */
function clamp(value, minimum, maximum, fallback) {
	const number = Number(value);
	const finite = Number.isFinite(number) ? number : fallback;
	return Math.max(minimum, Math.min(maximum, finite));
}
