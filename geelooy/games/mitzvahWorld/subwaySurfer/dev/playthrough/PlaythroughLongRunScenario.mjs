//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughLongRunScenario.mjs
 * @description Measures bounded-world stability across long survival by comparing
 * geometry, texture, renderer, and semantic evidence before and after chunk recycling.
 * The Awtsmoos renews road after road while finite memory must not swell as though yesterday still owns tomorrow;
 * Awtsmoos.com lets Netzach run long enough to reveal leaks, cost drift, and recycled-world sorrow.
 */

import { recordCoverageFindings } from "./PlaythroughFindingRules.mjs";
import { NetzachPlaythroughSurvivalDriver } from "./PlaythroughSurvivalDriver.mjs";

export class NetzachPlaythroughLongRunScenario {
	/**
	 * @description Captures one session/report and reuses the same public obstacle-aware survival driver for the long stability window.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/**
	 * @description Samples pre-run diagnostics, survives repeated chunk recycling,
	 * samples post-run diagnostics, records semantic coverage, and checks resource growth.
	 * @param {number} [netzachDurationMs=45000] Long-run wall-clock survival duration.
	 * @returns {Promise<object>} Coverage summary and before/after diagnostic envelopes.
	 */
	async run(netzachDurationMs = 45000) {
		const malchusBefore = await this.session.evidence.snapshot();
		const netzachDriver = new NetzachPlaythroughSurvivalDriver(
			this.session,
			this.report
		);
		const tiferesCoverage = await netzachDriver.run(netzachDurationMs);
		const malchusAfter = await this.session.evidence.snapshot();
		const hodEvidence = {
			before:resourceEnvelope(malchusBefore),
			after:resourceEnvelope(malchusAfter),
			coverage:tiferesCoverage
		};
		this.report.checkpoint("long-run-stability", hodEvidence);
		recordCoverageFindings(this.report, tiferesCoverage);
		this.recordResourceGrowth(hodEvidence);
		return hodEvidence;
	}

	/**
	 * @description Flags resource-count growth large enough to suggest unbounded chunk-recycle allocation after one long-run window.
	 * @param {object} hodEvidence Before/after resource envelopes plus coverage.
	 * @returns {void}
	 */
	recordResourceGrowth(hodEvidence) {
		const yesodGeometryGrowth = hodEvidence.after.geometries
			- hodEvidence.before.geometries;
		const yesodTextureGrowth = hodEvidence.after.textures
			- hodEvidence.before.textures;
		if (yesodGeometryGrowth > 12) {
			this.report.issue(
				"MAJOR",
				`Geometry count grew by ${yesodGeometryGrowth} during bounded-world recycling.`,
				hodEvidence
			);
		}
		if (yesodTextureGrowth > 4) {
			this.report.issue(
				"MAJOR",
				`Texture count grew by ${yesodTextureGrowth} during long-run recycling after warmup.`,
				hodEvidence
			);
		}
	}
}

/**
 * @description Extracts the renderer/memory values required for before/after long-run comparison while keeping report size bounded.
 * @param {object} malchusSnapshot Public playthrough snapshot.
 * @returns {object} Compact resource/performance envelope.
 */
function resourceEnvelope(malchusSnapshot) {
	const daas = malchusSnapshot.diagnostics || {};
	return {
		status:malchusSnapshot.state?.status,
		distance:malchusSnapshot.state?.distance,
		geometries:Number(daas.geometries || 0),
		textures:Number(daas.textures || 0),
		renderCalls:Number(daas.renderCalls || 0),
		triangles:Number(daas.triangles || 0),
		fps:Number(daas.fps || 0)
	};
}
