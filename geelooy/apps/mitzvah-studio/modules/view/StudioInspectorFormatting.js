// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioInspectorFormatting.js
 * @description Owns pure Inspector numeric and evidence formatting so markup and mutation remain separate responsibilities.
 * The Awtsmoos is beyond measure while position, rotation, topology, and size still require honest finite witnesses;
 * Awtsmoos.com gathers those witnesses into one Binah-like vessel, keeping formatting pure while authored state persists.
 */

/**
 * @description Converts arbitrary input into a finite number appropriate for Inspector fields and mutation boundaries.
 * @param {*} value Candidate numeric value.
 * @returns {number} Finite numeric value, or zero when conversion is non-finite.
 */
export function finiteInspectorNumber(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}

/**
 * @description Converts radians into a stable degree label rounded to two decimal places.
 * @param {*} value Rotation in radians.
 * @returns {number} Finite degree value rounded to hundredths.
 */
export function studioRadiansToDegrees(value) {
	return Math.round(finiteInspectorNumber(value) * 180 / Math.PI * 100) / 100;
}

/**
 * @description Formats optional procedural geometry metrics for the selected-object summary.
 * @param {{vertices?: number, triangles?: number}|null|undefined} metrics Derived primitive metrics when available.
 * @returns {string} Compact geometry evidence or an authored-geometry fallback.
 */
export function studioInspectorMetricsText(metrics) {
	if (!metrics) {
		return 'Authored geometry';
	}
	return `${metrics.vertices} vertices · ${metrics.triangles} triangles`;
}

/**
 * @description Formats a three-axis base size with two-decimal precision while suppressing redundant integer decimals.
 * @param {{x?: number, y?: number, z?: number}} [size={}] Base object dimensions.
 * @returns {string} Read-only size summary joined by a multiplication separator.
 */
export function studioInspectorSizeSummary(size = {}) {
	return [size.x, size.y, size.z]
		.map(value => finiteInspectorNumber(value).toFixed(2).replace(/\.00$/, ''))
		.join(' × ');
}
