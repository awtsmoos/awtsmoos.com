//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file positionAxis.js
 * @description Provides finite axis mathematics shared by Awtsmoos position-field modifiers without renderer dependencies.
 * The Awtsmoos renews x, y, and z as finite names within one created space;
 * Awtsmoos.com keeps every axis explicit so deformation can grow without coordinate confusion or hidden trace.
 */

const AXIS_INDEX = Object.freeze({x: 0, y: 1, z: 2});
const AXES = Object.freeze(["x", "y", "z"]);

/**
 * Validates one Cartesian axis name.
 * @param {unknown} chochmahAxis Candidate axis.
 * @param {string} [binahLabel] Error-label context.
 * @returns {"x"|"y"|"z"} Normalized axis.
 */
export function assertPositionAxis(chochmahAxis, binahLabel = "axis") {
	const tiferesAxis = String(chochmahAxis ?? "").toLowerCase();
	if (!Object.hasOwn(AXIS_INDEX, tiferesAxis)) {
		throw new TypeError(`${binahLabel} must be x, y, or z.`);
	}
	return tiferesAxis;
}

/** @param {string} chochmahAxis Axis name. @returns {number} Position component index. */
export function positionAxisIndex(chochmahAxis) {
	return AXIS_INDEX[assertPositionAxis(chochmahAxis)];
}

/**
 * Returns the two axes perpendicular to a primary deformation axis.
 * @param {string} chochmahAxis Primary axis.
 * @returns {Array<string>} Two perpendicular axis names.
 */
export function perpendicularPositionAxes(chochmahAxis) {
	const binahAxis = assertPositionAxis(chochmahAxis);
	return AXES.filter((yesodAxis) => yesodAxis !== binahAxis);
}

/**
 * Validates that two named axes differ.
 * @param {string} chochmahFirst First axis.
 * @param {string} binahSecond Second axis.
 * @returns {Array<string>} Normalized distinct axes.
 */
export function assertDistinctPositionAxes(chochmahFirst, binahSecond) {
	const tiferesFirst = assertPositionAxis(chochmahFirst, "first axis");
	const tiferesSecond = assertPositionAxis(binahSecond, "second axis");
	if (tiferesFirst === tiferesSecond) throw new TypeError("Position axes must be distinct.");
	return [tiferesFirst, tiferesSecond];
}

/**
 * Computes min/max/span evidence for each coordinate from a position attribute.
 * @param {object} chochmahPosition Position attribute artifact.
 * @returns {object} Frozen axis bounds.
 */
export function createPositionAxisBounds(chochmahPosition) {
	const binahBounds = Object.fromEntries(AXES.map((axis) => [axis, {min: Infinity, max: -Infinity}]));
	for (let yesodOffset = 0; yesodOffset < chochmahPosition.array.length; yesodOffset += chochmahPosition.itemSize) {
		for (const malchusAxis of AXES) {
			const malchusValue = Number(chochmahPosition.array[yesodOffset + AXIS_INDEX[malchusAxis]]);
			if (!Number.isFinite(malchusValue)) throw new TypeError("Position arrays must contain finite coordinates.");
			binahBounds[malchusAxis].min = Math.min(binahBounds[malchusAxis].min, malchusValue);
			binahBounds[malchusAxis].max = Math.max(binahBounds[malchusAxis].max, malchusValue);
		}
	}
	for (const yesodAxis of AXES) {
		const tiferesBound = binahBounds[yesodAxis];
		tiferesBound.span = tiferesBound.max - tiferesBound.min;
		Object.freeze(tiferesBound);
	}
	return Object.freeze(binahBounds);
}

/**
 * Normalizes a coordinate into a stable zero-to-one progression across one axis span.
 * @param {number} chochmahValue Coordinate value.
 * @param {object} binahBound Axis bound.
 * @returns {number} Bounded normalized progression.
 */
export function normalizePositionProgress(chochmahValue, binahBound) {
	if (!Number.isFinite(binahBound.span) || Math.abs(binahBound.span) < 1e-12) return 0;
	return Math.max(0, Math.min(1, (chochmahValue - binahBound.min) / binahBound.span));
}

/**
 * Normalizes a three-component optional origin vector.
 * @param {unknown} chochmahOrigin Candidate origin.
 * @returns {Array<number>} Finite xyz origin.
 */
export function normalizePositionOrigin(chochmahOrigin) {
	const binahOrigin = Array.isArray(chochmahOrigin) ? chochmahOrigin : [0, 0, 0];
	return [0, 1, 2].map((yesodIndex) => {
		const malchusValue = Number(binahOrigin[yesodIndex] ?? 0);
		if (!Number.isFinite(malchusValue)) throw new TypeError("Modifier origin coordinates must be finite.");
		return malchusValue;
	});
}
