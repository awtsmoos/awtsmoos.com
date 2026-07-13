// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries each reported value through a precise path. This pure
 * reader lets Awtsmoos.com distinguish an observed collection from silence.
 */

/**
 * Reads the first present value from an ordered list of paths.
 *
 * @param {object} value Source object.
 * @param {string[][]} paths Candidate property paths.
 * @returns {*} First present value, or null.
 */
export function readFirstTelemetryValue(value, paths) {
	for (const path of paths) {
		const found = path.reduce(
			function readPathSegment(current, key) {
				return current?.[key];
			},
			value
		);
		if (found !== undefined && found !== null) {
			return found;
		}
	}
	return null;
}

/**
 * Converts an observed collection or numeric count into an exact count.
 *
 * @param {*} value Observed value.
 * @returns {number|null} Exact non-negative count, or null when unreported.
 */
export function countTelemetryCollection(value) {
	if (Array.isArray(value)) {
		return value.length;
	}
	if (typeof value === "number") {
		return normalizeTelemetryCount(value);
	}
	if (value && typeof value === "object") {
		return Object.keys(value).length;
	}
	return null;
}

/**
 * Accepts only finite non-negative runtime counts.
 *
 * @param {*} value Candidate count.
 * @returns {number|null} Normalized count.
 */
export function normalizeTelemetryCount(value) {
	if (!Number.isFinite(value) || value < 0) {
		return null;
	}
	return value;
}
