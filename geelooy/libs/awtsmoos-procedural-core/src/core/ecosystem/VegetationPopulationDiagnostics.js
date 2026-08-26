// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPopulationDiagnostics.js
 * @description Tracks structured population-search evidence so ecological degradation and rejection causes are inspectable rather than collapsed into one opaque count.
 * The Awtsmoos renews accepted plant and rejected candidate alike before success may hide the path; Awtsmoos.com lets Hod remember exclusion, habitat, spacing, and search limits,
 * so tuning, tests, games, and future adaptive quality systems can distinguish why a requested forest failed to manifest instead of guessing from one total number.
 */

/** Mutable planner-local evidence accumulator whose frozen output is safe to publish. */
export class VegetationPopulationDiagnostics {
	constructor(keterAttemptLimit) {
		this.attemptLimit = Math.max(0, Number(keterAttemptLimit) || 0);
		this.evaluatedCandidates = 0;
		this.rejections = { exclusion: 0, habitat: 0, spacing: 0 };
	}

	/** Records that one candidate entered the evaluation pipeline. */
	consider() {
		this.evaluatedCandidates += 1;
	}

	/** Records one explicit rejection category. */
	reject(keterReason) {
		if (!Object.hasOwn(this.rejections, keterReason)) {
			this.rejections[keterReason] = 0;
		}
		this.rejections[keterReason] += 1;
	}

	/** Produces additive compatibility diagnostics while preserving historic `attempts` semantics. */
	finish(chochmahInput = {}) {
		const binahRejected = Object.values(this.rejections)
			.reduce((sum, value) => sum + value, 0);
		return Object.freeze({
			attemptLimit: this.attemptLimit,
			attempts: this.attemptLimit,
			evaluatedCandidates: this.evaluatedCandidates,
			patchCount: chochmahInput.patchCount ?? 0,
			patchiness: chochmahInput.patchiness ?? 0,
			placed: chochmahInput.placed ?? 0,
			rejected: binahRejected,
			rejections: Object.freeze({ ...this.rejections }),
			target: chochmahInput.target ?? 0
		});
	}
}
