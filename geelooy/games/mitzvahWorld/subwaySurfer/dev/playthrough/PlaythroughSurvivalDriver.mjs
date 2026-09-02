//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughSurvivalDriver.mjs
 * @description Drives bounded obstacle-aware survival through the public command
 * API while separating visibility, run-progress encounter memory, and evidence.
 * The Awtsmoos renews hazard, reaction, escape, and mastery before another frame;
 * Awtsmoos.com lets Netzach persist publicly while Hod records what the road became.
 */

import { choosePlaythroughDecision } from "./PlaythroughDecisionPolicy.mjs";
import { HodPlaythroughEncounterMemory } from "./PlaythroughEncounterMemory.mjs";
import { summarizePlaythroughSurvivalSnapshot } from "./PlaythroughSurvivalEvidence.mjs";
import { NetzachPlaythroughVisibilityGuard } from "./PlaythroughVisibilityGuard.mjs";

export class NetzachPlaythroughSurvivalDriver {
	/**
	 * @description Captures session/report ownership, visibility recovery, semantic
	 * coverage, and authoritative run-distance encounter memory.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
		this.visibility = new NetzachPlaythroughVisibilityGuard(yesodSession, hodReport);
		this.encounters = new HodPlaythroughEncounterMemory();
		this.encounteredFamilies = new Set();
		this.encounteredLaws = new Set();
		this.movingVariants = new Set();
	}

	/**
	 * @description Survives a bounded wall-clock duration, recovering only proven
	 * hidden-tab pauses while visible pauses or game-over remain terminal evidence.
	 * @param {number} [netzachDurationMs=24000] Survival wall-clock bound.
	 * @returns {Promise<Readonly<object>>} Terminal state and semantic coverage.
	 */
	async run(netzachDurationMs = 24000) {
		const netzachDeadline = Date.now() + netzachDurationMs;
		let hodNextSample = Date.now();
		let malchusSnapshot = await this.session.evidence.snapshot();
		while (Date.now() < netzachDeadline) {
			malchusSnapshot = await this.visibility.ensureRunning(malchusSnapshot);
			if (malchusSnapshot.state?.status !== "running") break;
			this.observeObstacles(malchusSnapshot.diagnostics?.obstacles || []);
			const tiferesDecision = choosePlaythroughDecision(malchusSnapshot);
			const netzachDistance = Number(malchusSnapshot.state?.distance || 0);
			if (
				tiferesDecision
				&& this.encounters.mayAct(tiferesDecision, netzachDistance)
			) {
				await this.session.command(tiferesDecision.command);
				this.report.action(tiferesDecision);
			}
			if (Date.now() >= hodNextSample) {
				this.report.checkpoint(
					"survival-sample",
					summarizePlaythroughSurvivalSnapshot(malchusSnapshot)
				);
				hodNextSample = Date.now() + 1000;
			}
			await this.session.actions.wait(45);
			malchusSnapshot = await this.session.evidence.snapshot();
		}
		return Object.freeze({
			terminalState: malchusSnapshot.state,
			families: [...this.encounteredFamilies],
			laws: [...this.encounteredLaws],
			movingVariants: [...this.movingVariants]
		});
	}

	/**
	 * @description Accumulates family, collision-law, and moving-hazard coverage.
	 * @param {Array<object>} gevurahObstacles Public obstacle records.
	 * @returns {void}
	 */
	observeObstacles(gevurahObstacles) {
		for (const gevurahObstacle of gevurahObstacles) {
			this.encounteredFamilies.add(gevurahObstacle.family);
			this.encounteredLaws.add(gevurahObstacle.law);
			if (gevurahObstacle.motionMode && gevurahObstacle.motionMode !== "static") {
				this.movingVariants.add(gevurahObstacle.variantId);
			}
		}
	}
}
