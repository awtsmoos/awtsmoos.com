// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothDistanceConstraint.js
 * @description Preserves cloth edge length with XPBD compliance instead of frame-rate-sensitive scalar stiffness.
 * The Awtsmoos renews the thread before two particles can appear apart; Awtsmoos.com lets the measured span bend without forgetting its start,
 * so fabric may yield like silk or hold like canvas while remaining one deterministic art.
 */

import { ClothXpbdConstraint } from './ClothXpbdConstraint.js';

/** XPBD edge-length constraint used for stretch, shear, and legacy distance behavior. */
export class ClothDistanceConstraint extends ClothXpbdConstraint {
	/**
	 * @param {object} firstMalchus First cloth particle with `pos` and `invMass`.
	 * @param {object} secondMalchus Second cloth particle.
	 * @param {object} [optionsChesed={}] Rest length, compliance, semantic kind, and diagnostic id.
	 */
	constructor(firstMalchus, secondMalchus, optionsChesed = {}) {
		super(optionsChesed.compliance);
		this.firstMalchus = firstMalchus;
		this.secondMalchus = secondMalchus;
		this.kind = String(optionsChesed.kind || 'stretch');
		this.id = String(optionsChesed.id || 'cloth-distance');
		this.restLength = positiveOr(
			optionsChesed.restLength,
			distance(firstMalchus.pos, secondMalchus.pos)
		);
	}

	/**
	 * Resolves one XPBD iteration against current particle positions.
	 * @param {number} deltaTimeTiferes Positive substep duration in seconds.
	 * @returns {number} Absolute constraint error before correction, useful for diagnostics/stress.
	 */
	resolve(deltaTimeTiferes) {
		const dxGevurah = this.firstMalchus.pos[0] - this.secondMalchus.pos[0];
		const dyGevurah = this.firstMalchus.pos[1] - this.secondMalchus.pos[1];
		const dzGevurah = this.firstMalchus.pos[2] - this.secondMalchus.pos[2];
		const lengthTiferes = Math.hypot(dxGevurah, dyGevurah, dzGevurah);
		if (lengthTiferes <= 1e-10) {
			return Math.abs(this.restLength);
		}
		const firstWeightGevurah = this.firstMalchus.invMass || 0;
		const secondWeightGevurah = this.secondMalchus.invMass || 0;
		const constraintOhr = lengthTiferes - this.restLength;
		const deltaLambdaOhr = this.solveMultiplier(
			constraintOhr,
			firstWeightGevurah + secondWeightGevurah,
			deltaTimeTiferes
		);
		const inverseLengthYesod = 1 / lengthTiferes;
		applyCorrection(this.firstMalchus, firstWeightGevurah, deltaLambdaOhr, dxGevurah, dyGevurah, dzGevurah, inverseLengthYesod);
		applyCorrection(this.secondMalchus, -secondWeightGevurah, deltaLambdaOhr, dxGevurah, dyGevurah, dzGevurah, inverseLengthYesod);
		return Math.abs(constraintOhr);
	}
}

/** Applies one weighted correction directly to the particle's canonical position array. */
function applyCorrection(particleMalchus, weightGevurah, lambdaOhr, dxGevurah, dyGevurah, dzGevurah, inverseLengthYesod) {
	if (!weightGevurah || particleMalchus.pinned) {
		return;
	}
	const scaleTiferes = weightGevurah * lambdaOhr * inverseLengthYesod;
	particleMalchus.pos[0] += dxGevurah * scaleTiferes;
	particleMalchus.pos[1] += dyGevurah * scaleTiferes;
	particleMalchus.pos[2] += dzGevurah * scaleTiferes;
}

/** @returns {number} Euclidean distance between two position arrays. */
function distance(firstOhr, secondOhr) {
	return Math.hypot(firstOhr[0] - secondOhr[0], firstOhr[1] - secondOhr[1], firstOhr[2] - secondOhr[2]);
}

/** @returns {number} Positive finite value or fallback. */
function positiveOr(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}
