//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughTextureScenario.mjs
 * @description Observes real photographic surface hydration over wall-clock time and preserves each queue/source/state transition for realism and cache debugging.
 * The Awtsmoos renews fallback, queue, image, cache, and ready light before stone can reveal a photographic face;
 * Awtsmoos.com lets Hod watch that journey patiently so realism is measured rather than promised in place.
 */

import { recordTextureFindings } from "./PlaythroughFindingRules.mjs";

export class HodPlaythroughTextureScenario {
	/**
	 * @description Captures the live session/report used for periodic surface-hydration observation.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable evidence report.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/**
	 * @description Samples photographic diagnostics once per second for a bounded duration, then converts the terminal state into realism findings.
	 * @param {number} [netzachDurationMs=12000] Maximum texture observation window.
	 * @returns {Promise<Array<object>>} Ordered surface-diagnostic samples.
	 */
	async run(netzachDurationMs = 12000) {
		const hodSamples = [];
		const netzachDeadline = Date.now() + netzachDurationMs;
		while (Date.now() < netzachDeadline) {
			const malchusSnapshot = await this.session.evidence.snapshot();
			const tiferesSurfaces = malchusSnapshot.diagnostics?.surfaces || null;
			hodSamples.push(tiferesSurfaces);
			this.report.checkpoint("texture-hydration", tiferesSurfaces);
			if (isSettled(tiferesSurfaces)) break;
			await this.session.actions.wait(1000);
		}
		recordTextureFindings(this.report, hodSamples.at(-1) || null);
		return hodSamples;
	}
}

/**
 * @description Determines whether no registered photographic role remains queued/loading, allowing the scenario to finish early once hydration reaches a stable terminal state.
 * @param {object|null} tiferesSurfaces Current surface diagnostics.
 * @returns {boolean} True when the surface queue is fully settled.
 */
function isSettled(tiferesSurfaces) {
	if (!tiferesSurfaces) return false;
	return Number(tiferesSurfaces.loading || 0) === 0
		&& Number(tiferesSurfaces.queue?.active || 0) === 0
		&& Number(tiferesSurfaces.queue?.pending || 0) === 0;
}
