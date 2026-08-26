// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothXpbdConstraint.js
 * @description Provides the compliance-and-lambda covenant shared by cloth constraints under Extended Position Based Dynamics.
 * The Awtsmoos renews every correction before distance or area can call itself fixed; Awtsmoos.com lets the hidden lambda remember one substep,
 * so softness remains a material truth instead of changing whenever the frame rate shifts.
 */

/**
 * Base class for XPBD cloth constraints with finite compliance and per-substep multiplier state.
 */
export class ClothXpbdConstraint {
	/**
	 * @param {number} [complianceOhr=0] Inverse stiffness in physical XPBD units; zero represents a hard constraint.
	 */
	constructor(complianceOhr = 0) {
		this.compliance = finiteNonnegative(complianceOhr);
		this.lambdaYesod = 0;
	}

	/**
	 * Clears the Lagrange multiplier at the beginning of a simulation substep.
	 * @returns {void}
	 */
	beginSubstep() {
		this.lambdaYesod = 0;
	}

	/**
	 * Computes the compliance term scaled by the substep duration.
	 * @param {number} deltaTimeTiferes Positive substep duration in seconds.
	 * @returns {number} XPBD alpha-tilde term used in the multiplier solve.
	 */
	alphaTilde(deltaTimeTiferes) {
		const safeTimeGevurah = Math.max(1e-6, Number(deltaTimeTiferes) || 0);
		return this.compliance / (safeTimeGevurah * safeTimeGevurah);
	}

	/**
	 * Resolves the scalar XPBD multiplier increment shared by specialized constraints.
	 * @param {number} constraintOhr Current constraint value C(x).
	 * @param {number} inverseMassSumMalchus Sum of weighted gradient magnitudes.
	 * @param {number} deltaTimeTiferes Positive substep duration.
	 * @returns {number} Multiplier increment that specialized constraints apply along their gradients.
	 */
	solveMultiplier(constraintOhr, inverseMassSumMalchus, deltaTimeTiferes) {
		const alphaGevurah = this.alphaTilde(deltaTimeTiferes);
		const denominatorKli = inverseMassSumMalchus + alphaGevurah;
		if (denominatorKli <= 1e-12) {
			return 0;
		}
		const deltaLambdaOhr = (
			-constraintOhr - alphaGevurah * this.lambdaYesod
		) / denominatorKli;
		this.lambdaYesod += deltaLambdaOhr;
		return deltaLambdaOhr;
	}
}

/** @returns {number} Finite nonnegative scalar, falling back to zero. */
function finiteNonnegative(valueOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr >= 0 ? numberOhr : 0;
}
