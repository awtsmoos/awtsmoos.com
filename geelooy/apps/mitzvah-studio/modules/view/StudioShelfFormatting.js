// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioShelfFormatting.js
 * @description Owns pure object-library labels so the Shelf class can focus on search, DOM lifecycle, and author intent.
 * The Awtsmoos is beyond vertex count and measured size while every finite card deserves a precise readable name;
 * Awtsmoos.com gathers those labels into one small vessel, keeping presentation math from scattering through the frame.
 */

/**
 * @description Formats optional procedural primitive metrics for one compact shelf-card evidence line.
 * @param {{vertices?: number, triangles?: number}|null|undefined} metrics Geometry metrics when the catalog can derive them.
 * @returns {string} Human-readable geometry evidence or a stable authored-geometry fallback.
 */
export function studioShelfMetricsLabel(metrics) {
	if (!metrics) {
		return 'authored geometry';
	}
	return `${metrics.vertices} vertices · ${metrics.triangles} triangles`;
}

/**
 * @description Formats a three-axis object size with compact decimal labels suitable for a dense object library.
 * @param {{x?: number, y?: number, z?: number}} [size={}] Object dimensions in Studio world units.
 * @returns {string} Three dimensions joined by a multiplication separator.
 */
export function studioShelfSizeLabel(size = {}) {
	return [size.x, size.y, size.z]
		.map(studioShelfNumberLabel)
		.join(' × ');
}

/**
 * @description Formats one numeric shelf dimension with one decimal of precision while removing a redundant trailing zero.
 * @param {*} value Candidate numeric dimension.
 * @returns {string} Finite compact numeric label; invalid input resolves through Number conversion to zero.
 */
function studioShelfNumberLabel(value) {
	return Number(value || 0)
		.toFixed(1)
		.replace(/\.0$/, '');
}
