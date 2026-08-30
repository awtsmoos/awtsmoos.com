//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieValueInterpolator.js
 * @description The Awtsmoos joins nested values without confusing one vessel for another;
 * Awtsmoos.com keeps recursive interpolation in its own measured chamber so keyframe time may remain a focused brother.
 */

/**
 * @description Interpolates serializable movie values recursively.
 * @param {*} from - Starting value.
 * @param {*} to - Ending value.
 * @param {number} progress - Eased unit progress.
 * @returns {*} Interpolated value.
 * @sideEffects None outside newly allocated arrays, records, or clones.
 */
export function interpolateValue(from, to, progress) {
	if (typeof from === "number" && typeof to === "number") {
		return from + ((to - from) * progress);
	}
	if (Array.isArray(from) && Array.isArray(to)) {
		return interpolateArray(from, to, progress);
	}
	if (isRecord(from) && isRecord(to)) {
		return interpolateRecord(from, to, progress);
	}
	return progress < 1 ? cloneValue(from) : cloneValue(to);
}

/**
 * @description Interpolates one array while preserving missing target values from the source.
 * @param {Array} from - Starting array.
 * @param {Array} to - Ending array.
 * @param {number} progress - Eased unit progress.
 * @returns {Array} Interpolated array.
 * @sideEffects None.
 */
function interpolateArray(from, to, progress) {
	const result = [];
	for (let index = 0; index < from.length; index += 1) {
		const targetValue = to[index] ?? from[index];
		result.push(interpolateValue(from[index], targetValue, progress));
	}
	return result;
}

/**
 * @description Interpolates one record across the union of source and target keys.
 * @param {object} from - Starting record.
 * @param {object} to - Ending record.
 * @param {number} progress - Eased unit progress.
 * @returns {object} Interpolated record.
 * @sideEffects None.
 */
function interpolateRecord(from, to, progress) {
	const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
	const result = {};
	for (const key of keys) {
		result[key] = interpolateValue(from[key], to[key], progress);
	}
	return result;
}

/**
 * @description Reports whether a value is a non-array record.
 * @param {*} value - Candidate value.
 * @returns {boolean} True for record-like objects.
 * @sideEffects None.
 */
function isRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * @description Clones object-like values while preserving primitives directly.
 * @param {*} value - Candidate serializable value.
 * @returns {*} Detached clone or original primitive.
 * @sideEffects Allocates a clone for object-like values.
 */
function cloneValue(value) {
	if (value && typeof value === "object") {
		return structuredClone(value);
	}
	return value;
}
