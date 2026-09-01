//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughLongRunScenario.mjs
 * @description Requires sustained running lifecycle, real distance/time progression, semantic coverage, and bounded renderer resources across the long recycling window.
 * The Awtsmoos renews road after road while time, lifecycle, geometry, and texture must each reveal their finite trace;
 * Awtsmoos.com lets Netzach reject a paused or motionless shell while bounded memory keeps its measured place.
 */

import { recordCoverageFindings } from "./PlaythroughFindingRules.mjs";
import { NetzachPlaythroughSurvivalDriver } from "./PlaythroughSurvivalDriver.mjs";

const MINIMUM_LONG_RUN_DISTANCE_GROWTH = 2;
const MINIMUM_LONG_RUN_ELAPSED_GROWTH = 0.2;

export class NetzachPlaythroughLongRunScenario {
	/**
	 * @description Captures one session/report and reuses the public obstacle-aware survival driver for the long stability window.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/**
	 * @description Measures before/after lifecycle, progression, coverage, and resources across long obstacle-aware survival.
	 * @param {number} [netzachDurationMs=45000] Long-run wall-clock duration.
	 * @returns {Promise<object>} Coverage summary and before/after envelopes.
	 */
	async run(netzachDurationMs = 45000) {
		const malchusBefore = await this.session.evidence.snapshot();
		const tiferesCoverage = await new NetzachPlaythroughSurvivalDriver(
			this.session,
			this.report
		).run(netzachDurationMs);
		const malchusAfter = await this.session.evidence.snapshot();
		const hodEvidence = {
			before:resourceEnvelope(malchusBefore),
			after:resourceEnvelope(malchusAfter),
			coverage:tiferesCoverage
		};
		this.report.checkpoint("long-run-stability", hodEvidence);
		recordCoverageFindings(this.report, tiferesCoverage);
		this.recordLifecycleAndProgression(hodEvidence);
		this.recordResourceGrowth(hodEvidence);
		return hodEvidence;
	}

	/**
	 * @description Rejects non-running terminal state or insufficient distance/elapsed growth even when other counters remain stable.
	 * @param {object} hodEvidence Before/after progression and coverage evidence.
	 * @returns {void}
	 */
	recordLifecycleAndProgression(hodEvidence) {
		const netzachDistanceGrowth = hodEvidence.after.distance - hodEvidence.before.distance;
		const netzachElapsedGrowth = hodEvidence.after.elapsed - hodEvidence.before.elapsed;
		if (hodEvidence.after.status !== "running") {
			this.report.issue(
				"BLOCKER",
				`Long-run simulation ended in ${hodEvidence.after.status || "unknown"} instead of running.`,
				hodEvidence
			);
		}
		if (
			netzachDistanceGrowth < MINIMUM_LONG_RUN_DISTANCE_GROWTH
			|| netzachElapsedGrowth < MINIMUM_LONG_RUN_ELAPSED_GROWTH
		) {
			this.report.issue(
				"BLOCKER",
				"Long-run simulation did not measurably advance distance and elapsed time.",
				hodEvidence
			);
		}
	}

	/**
	 * @description Flags renderer-resource growth large enough to suggest unbounded chunk-recycle allocation.
	 * @param {object} hodEvidence Before/after resource envelopes plus coverage.
	 * @returns {void}
	 */
	recordResourceGrowth(hodEvidence) {
		const yesodGeometryGrowth = hodEvidence.after.geometries - hodEvidence.before.geometries;
		const yesodTextureGrowth = hodEvidence.after.textures - hodEvidence.before.textures;
		if (yesodGeometryGrowth > 12) {
			this.report.issue("MAJOR", `Geometry count grew by ${yesodGeometryGrowth} during bounded-world recycling.`, hodEvidence);
		}
		if (yesodTextureGrowth > 4) {
			this.report.issue("MAJOR", `Texture count grew by ${yesodTextureGrowth} during long-run recycling after warmup.`, hodEvidence);
		}
	}
}

/**
 * @description Extracts progression and renderer values needed for bounded before/after comparison.
 * @param {object} malchusSnapshot Public playthrough snapshot.
 * @returns {object} Compact lifecycle/progression/resource envelope.
 */
function resourceEnvelope(malchusSnapshot) {
	const daas = malchusSnapshot.diagnostics || {};
	return {
		status:malchusSnapshot.state?.status,
		distance:Number(malchusSnapshot.state?.distance || 0),
		elapsed:Number(malchusSnapshot.state?.elapsed || 0),
		geometries:Number(daas.geometries || 0),
		textures:Number(daas.textures || 0),
		renderCalls:Number(daas.renderCalls || 0),
		triangles:Number(daas.triangles || 0),
		fps:Number(daas.fps || 0)
	};
}
