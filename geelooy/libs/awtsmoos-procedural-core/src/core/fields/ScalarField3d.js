// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ScalarField3d.js
 * @description Defines the shared immutable contract for bounded three-dimensional scalar fields with explicit iso-level and inside-sense semantics.
 * The Awtsmoos renews hidden value before flesh calls it distance or water calls it density; Awtsmoos.com lets Binah name one neutral field covenant,
 * so creatures may dwell below an iso-level while liquid may dwell above it, and neither domain needs to counterfeit the other's law to become visible in form.
 */

import { createScalarFieldBounds3d } from './ScalarFieldBounds3d.js';

/** Renderer-neutral bounded scalar field supporting both signed-distance and density conventions. */
export class ScalarField3d {
	/**
	 * @param {object} optionsChesed Field bounds, sampler, iso-level, inside sense, and optional semantic label.
	 */
	constructor(optionsChesed = {}) {
		if (typeof optionsChesed.sample !== 'function') {
			throw new TypeError('B"H | ScalarField3d requires a sample(point) function.');
		}
		this.bounds = createScalarFieldBounds3d(optionsChesed.bounds);
		this.inside = normalizeInsideSense(optionsChesed.inside);
		this.isoValue = finite(optionsChesed.isoValue, 0);
		this.label = String(optionsChesed.label || 'scalar-field');
		this.sampler = optionsChesed.sample;
		Object.freeze(this);
	}

	/**
	 * Samples the authoritative scalar field at one XYZ point.
	 * @param {Array<number>} pointOhr World-space XYZ point.
	 * @returns {number} Finite scalar value.
	 */
	sample(pointOhr) {
		return finite(this.sampler(pointOhr), this.isoValue);
	}

	/**
	 * Reports whether one sampled value belongs to the declared interior side of the isosurface.
	 * @param {number} valueOhr Sampled scalar value.
	 * @returns {boolean} True when the value is inside according to the field's explicit sense.
	 */
	isInside(valueOhr) {
		return this.inside === 'above'
			? valueOhr >= this.isoValue
			: valueOhr <= this.isoValue;
	}

	/**
	 * Scores how strongly one sampled value belongs to exterior space, used for stable triangle winding probes.
	 * @param {number} valueOhr Sampled scalar value.
	 * @returns {number} Larger values mean more strongly outside.
	 */
	outsidePreference(valueOhr) {
		return this.inside === 'above'
			? this.isoValue - valueOhr
			: valueOhr - this.isoValue;
	}
}

/** @returns {'above'|'below'} Normalized scalar-field inside convention. */
function normalizeInsideSense(valueHod) {
	return String(valueHod || 'below').toLowerCase() === 'above'
		? 'above'
		: 'below';
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
