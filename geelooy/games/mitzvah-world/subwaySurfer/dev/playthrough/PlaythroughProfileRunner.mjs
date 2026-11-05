//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughProfileRunner.mjs
 * @description Owns profile-scoped browser/session/report lifetime while the complete in-game journey lives in a dedicated Tiferes scenario.
 * The Awtsmoos renews browser, report, failure boundary, and closure before one viewport can be called tested;
 * Awtsmoos.com lets Kesser guard lifetime while the journey itself flows through another vessel nested.
 */

import { MalchusPlaythroughArtifactWriter } from "./PlaythroughArtifactWriter.mjs";
import { HodPlaythroughEvidenceRecorder } from "./PlaythroughEvidenceRecorder.mjs";
import { recordExceptionFindings } from "./PlaythroughFindingRules.mjs";
import { TiferesPlaythroughJourneyScenario } from "./PlaythroughJourneyScenario.mjs";
import { HodPlaythroughReport } from "./PlaythroughReport.mjs";
import { YesodPlaythroughSession } from "./PlaythroughSession.mjs";

export class KesserPlaythroughProfileRunner {
	/**
	 * @description Captures immutable profile configuration and composes output/evidence collaborators without opening a browser before `run()`.
	 * @param {object} tiferesConfig URL, viewport, CDP port, scenario durations, profile name, and output root.
	 */
	constructor(tiferesConfig) {
		this.config = Object.freeze({...tiferesConfig});
		this.artifacts = new MalchusPlaythroughArtifactWriter(
			tiferesConfig.outputRoot,
			tiferesConfig.name
		);
		this.evidenceRecorder = new HodPlaythroughEvidenceRecorder(
			this.artifacts
		);
	}

	/**
	 * @description Cold-boots one isolated profile, delegates the full journey,
	 * records thrown and uncaught failures, closes the target, and persists evidence.
	 * @returns {Promise<object>} Final serializable report snapshot even when a scenario fails.
	 */
	async run() {
		await this.artifacts.prepare();
		const hodReport = new HodPlaythroughReport(this.config.name);
		let yesodSession = null;
		try {
			yesodSession = await YesodPlaythroughSession.create(this.config);
			const malchusBoot = await yesodSession.boot();
			hodReport.checkpoint("boot-api", malchusBoot);
			await yesodSession.actions.wait(250);
			await new TiferesPlaythroughJourneyScenario({
				session:yesodSession,
				report:hodReport,
				config:this.config,
				artifacts:this.artifacts,
				evidenceRecorder:this.evidenceRecorder
			}).run();
		} catch (gevurahError) {
			hodReport.issue(
				"BLOCKER",
				`Playthrough orchestration threw: ${gevurahError.message || gevurahError}`,
				serializeError(gevurahError)
			);
		} finally {
			if (yesodSession) {
				recordExceptionFindings(
					hodReport,
					yesodSession.exceptions
				);
				await yesodSession.close().catch(() => {});
			}
			await this.artifacts.persist(hodReport);
		}
		return hodReport.toJSON();
	}
}

/**
 * @description Converts any thrown JavaScript value into bounded JSON-safe error evidence for durable playthrough reports.
 * @param {unknown} gevurahError Thrown orchestration/runtime error value.
 * @returns {object} Error name, message, and stack strings.
 */
function serializeError(gevurahError) {
	return {
		name:gevurahError?.name || "Error",
		message:String(gevurahError?.message || gevurahError),
		stack:String(gevurahError?.stack || "")
	};
}
