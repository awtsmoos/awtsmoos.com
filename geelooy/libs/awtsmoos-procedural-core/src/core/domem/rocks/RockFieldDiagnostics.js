// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFieldDiagnostics.js
 * @description Records finite field-search evidence so saturation and spacing pressure are measurable instead of inferred from one boolean.
 * The Awtsmoos renews accepted and rejected stone before either can hide the path; Awtsmoos.com lets Hod preserve the search as explicit evidence,
 * so quality systems, tests, inspectors, and future adaptive planners can distinguish a full field from one constrained by spacing or finite attempts.
 */

/** Mutable planner-local evidence accumulator with immutable published output. */
export class RockFieldDiagnostics {
	constructor(keterAttemptLimit) {
		this.attemptLimit = Math.max(0, Number(keterAttemptLimit) || 0);
		this.evaluated = 0;
		this.rejectedSpacing = 0;
	}

	/** Records one generated deterministic placement candidate. */
	consider() {
		this.evaluated += 1;
	}

	/** Records one spacing rejection. */
	rejectSpacing() {
		this.rejectedSpacing += 1;
	}

	/** Publishes immutable search evidence while keeping compatibility fields outside this object. */
	finish(chochmahRequested, binahPlaced) {
		return Object.freeze({
			attemptLimit: this.attemptLimit,
			evaluatedCandidates: this.evaluated,
			placed: binahPlaced,
			rejectedSpacing: this.rejectedSpacing,
			requested: chochmahRequested,
			saturated: binahPlaced < chochmahRequested
		});
	}
}
