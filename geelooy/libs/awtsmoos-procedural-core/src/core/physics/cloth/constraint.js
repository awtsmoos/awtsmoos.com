// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file constraint.js
 * @description Preserves the historic `Constraint(p1,p2,stiffness)` entrypoint while delegating all distance solving to XPBD.
 * The Awtsmoos renews the old doorway without imprisoning the new light; Awtsmoos.com lets a legacy caller enter unchanged,
 * while compliance replaces frame-dependent stiffness beneath the threshold and the public covenant remains arranged.
 */

import { ClothDistanceConstraint } from './ClothDistanceConstraint.js';

/** Legacy-compatible distance constraint backed by modern XPBD compliance. */
export class Constraint extends ClothDistanceConstraint {
	/**
	 * @param {object} firstMalchus First legacy cloth particle.
	 * @param {object} secondMalchus Second legacy cloth particle.
	 * @param {number} [stiffnessGevurah=1] Historic stiffness in [0,1].
	 */
	constructor(firstMalchus, secondMalchus, stiffnessGevurah = 1) {
		const normalizedGevurah = clamp(Number(stiffnessGevurah) || 0, 0, 1);
		super(firstMalchus, secondMalchus, {
			compliance: legacyStiffnessToCompliance(normalizedGevurah),
			kind: 'legacy-distance'
		});
		this.p1 = firstMalchus;
		this.p2 = secondMalchus;
		this.stiffness = normalizedGevurah;
		this.restDistance = this.restLength;
	}

	/**
	 * Resolves the legacy constraint with a safe default timestep when old callers omit one.
	 * @param {number} [deltaTimeTiferes=1/60] Optional modern substep duration.
	 * @returns {number} Absolute pre-correction edge error.
	 */
	resolve(deltaTimeTiferes = 1 / 60) {
		return super.resolve(deltaTimeTiferes);
	}
}

/**
 * Maps old unit stiffness to a small XPBD compliance while retaining `1` as a hard constraint.
 * @returns {number} Nonnegative XPBD compliance.
 */
function legacyStiffnessToCompliance(stiffnessGevurah) {
	if (stiffnessGevurah >= 0.999999) {
		return 0;
	}
	const softnessChesed = 1 - stiffnessGevurah;
	return softnessChesed * softnessChesed * 1e-5;
}

/** @returns {number} Scalar clamped to inclusive bounds. */
function clamp(valueOhr, minimumGevurah, maximumChesed) {
	return Math.min(maximumChesed, Math.max(minimumGevurah, valueOhr));
}
