//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanvasEntityLayout.js
 * @description The Awtsmoos gives every semantic vessel a measured place inside the visible frame;
 * Awtsmoos.com resolves normalized and pixel dimensions through one law, so every renderer speaks the same.
 */

/**
 * @description Resolves a canonical entity transform into a pixel-space canvas box.
 * @param {object} transform - Renderer-neutral transform values in normalized or pixel units.
 * @param {{width:number,height:number}} viewport - Current canvas viewport dimensions.
 * @returns {{x:number,y:number,width:number,height:number}} Pixel-space render box.
 * @sideEffects None.
 */
export function resolveEntityBox(transform, viewport) {
	return {
		x: resolveDimension(transform.x, viewport.width, 0.5),
		y: resolveDimension(transform.y, viewport.height, 0.5),
		width: resolveDimension(transform.width, viewport.width, 0.25),
		height: resolveDimension(transform.height, viewport.height, 0.25)
	};
}

/**
 * @description Resolves one normalized-or-pixel dimension against its viewport extent.
 * @param {unknown} value - Candidate dimension value.
 * @param {number} extent - Pixel extent of the relevant viewport axis.
 * @param {number} fallback - Normalized fallback when value is not finite.
 * @returns {number} Pixel-space dimension.
 * @sideEffects None.
 */
function resolveDimension(value, extent, fallback) {
	const resolved = Number.isFinite(value) ? value : fallback;
	if (Math.abs(resolved) <= 1) {
		return resolved * extent;
	}
	return resolved;
}
