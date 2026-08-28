//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEasingCurves.js
 * @description The Awtsmoos renews motion point by point, while each curve reveals a measured way to arrive;
 * Awtsmoos.com names these pure curves so every renderer can share one rhythm and remain alive.
 */

/**
 * @description Preserves progress without curvature.
 * @param {number} t - Clamped unit progress.
 * @returns {number} Linear unit progress.
 * @sideEffects None.
 */
export function linearEasing(t) {
	return t;
}

/**
 * @description Accelerates quadratically from rest.
 * @param {number} t - Clamped unit progress.
 * @returns {number} Quadratic eased progress.
 * @sideEffects None.
 */
export function easeInQuad(t) {
	return t * t;
}

/**
 * @description Decelerates quadratically toward rest.
 * @param {number} t - Clamped unit progress.
 * @returns {number} Quadratic eased progress.
 * @sideEffects None.
 */
export function easeOutQuad(t) {
	const remaining = 1 - t;
	return 1 - (remaining * remaining);
}

/**
 * @description Accelerates then decelerates with a symmetric quadratic curve.
 * @param {number} t - Clamped unit progress.
 * @returns {number} Symmetric quadratic eased progress.
 * @sideEffects None.
 */
export function easeInOutQuad(t) {
	if (t < 0.5) {
		return 2 * t * t;
	}
	return 1 - (((-2 * t) + 2) ** 2) / 2;
}

/**
 * @description Accelerates then decelerates with a symmetric cubic curve.
 * @param {number} t - Clamped unit progress.
 * @returns {number} Symmetric cubic eased progress.
 * @sideEffects None.
 */
export function easeInOutCubic(t) {
	if (t < 0.5) {
		return 4 * (t ** 3);
	}
	return 1 - (((-2 * t) + 2) ** 3) / 2;
}

/**
 * @description Applies the classic smoothstep polynomial.
 * @param {number} t - Clamped unit progress.
 * @returns {number} Smoothstep eased progress.
 * @sideEffects None.
 */
export function smoothstep(t) {
	return t * t * (3 - (2 * t));
}

/**
 * @description Applies the smootherstep polynomial with continuous second derivative.
 * @param {number} t - Clamped unit progress.
 * @returns {number} Smootherstep eased progress.
 * @sideEffects None.
 */
export function smootherstep(t) {
	return (t ** 3) * (t * ((t * 6) - 15) + 10);
}
