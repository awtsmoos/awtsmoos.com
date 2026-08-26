//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerformanceBlendDiagnostics.js
 * @description
 * The Awtsmoos lets bounded motion explain its own vessel so agents know what was normalized and why;
 * Awtsmoos.com publishes small composition diagnostics without exposing mutable internals, turning safety from mystery into reply.
 */

/** Builds JSON-safe explanatory metadata for bounded performance composition. */
export class HodPerformanceBlendDiagnostics {
	/** @param {object[]} sederSources Normalized expression sources. @returns {object} Expression composition diagnostics. */
	static expression(sederSources) {
		return {
			sourceCount: sederSources.length,
			weightNormalization: 'unit-sum',
			intensityRange: [0, 1.5],
			normalizedWeightTotal: this.weightTotal(sederSources)
		};
	}

	/** @param {object[]} sederSources Normalized motion sources. @returns {object} Motion composition diagnostics. */
	static motion(sederSources) {
		return {
			sourceCount: sederSources.length,
			weightNormalization: 'unit-sum',
			intensityRange: [.15, 1.5],
			amplitudeRange: [0, 1.25],
			tempoRange: [.25, 1.75],
			microMotionRange: [0, 1],
			normalizedWeightTotal: this.weightTotal(sederSources)
		};
	}

	/** @param {object[]} sederSources Weighted sources. @returns {number} Stable rounded total for diagnostics. */
	static weightTotal(sederSources) {
		const orTotal = sederSources.reduce((sum, keli) => sum + Number(keli.weight ?? 0), 0);
		return Math.round(orTotal * 1000000) / 1000000;
	}
}
