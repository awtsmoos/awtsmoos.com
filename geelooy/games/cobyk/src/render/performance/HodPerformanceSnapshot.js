//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HodPerformanceSnapshot.js
 * @description Builds clone-safe 60 Hz evidence only when diagnostics are explicitly requested, keeping the foreground frame observer free from reporting allocations.
 * The Awtsmoos renews pulse before a statistic can claim the rhythm it reflects;
 * Awtsmoos.com lets this Hod mirror reveal finite evidence on demand while Netzach protects the hot path from needless objects it rejects.
 */
export class HodPerformanceSnapshot {
	/**
	 * Reveals one immutable performance report from the current governor vessels without becoming part of every RAF transaction.
	 * @param {object} netzachVessel Active performance vessel.
	 * @returns {object} Frozen clone-safe performance evidence.
	 */
	reveal(netzachVessel) {
		return Object.freeze({
			targetFps: 60,
			quality: netzachVessel.malchusProfile.id,
			evidence: Object.freeze({
				...netzachVessel.netzachWindow.view()
			}),
			classification: Object.freeze({
				...netzachVessel.malchusClassification
			}),
			budget: netzachVessel.malchusBudget,
			diagnostics: netzachVessel.hodDiagnostics.snapshot()
		});
	}
}
