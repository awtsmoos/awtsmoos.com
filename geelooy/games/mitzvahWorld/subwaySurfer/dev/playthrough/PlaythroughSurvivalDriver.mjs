//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughSurvivalDriver.mjs
 * @description Drives bounded obstacle-aware survival through the public command API while separating browser visibility recovery and compact evidence ownership.
 * The Awtsmoos renews hazard, reaction, visibility, escape, and mastery before a simulated traveler survives another frame;
 * Awtsmoos.com lets Netzach persist through the same public doorway while Hod records what the moving road became.
 */

import { choosePlaythroughDecision } from "./PlaythroughDecisionPolicy.mjs";
import { summarizePlaythroughSurvivalSnapshot } from "./PlaythroughSurvivalEvidence.mjs";
import { NetzachPlaythroughVisibilityGuard } from "./PlaythroughVisibilityGuard.mjs";

const ACTION_COOLDOWN_MS = 900;

export class NetzachPlaythroughSurvivalDriver {
	/**
	 * @description Captures one session/report, visibility guard, semantic coverage, and short-lived action cooldown evidence.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
		this.visibility = new NetzachPlaythroughVisibilityGuard(yesodSession, hodReport);
		this.lastActionAt = new Map();
		this.encounteredFamilies = new Set();
		this.encounteredLaws = new Set();
		this.movingVariants = new Set();
	}

	/**
	 * @description Survives a bounded wall-clock duration, recovering only proven hidden-tab pauses while treating visible pauses or game-over as terminal evidence.
	 * @param {number} [netzachDurationMs=24000] Maximum wall-clock survival duration in milliseconds.
	 * @returns {Promise<Readonly<object>>} Terminal state plus encountered semantic coverage.
	 */
	async run(netzachDurationMs = 24000) {
		const netzachDeadline = Date.now() + netzachDurationMs;
		let hodNextSample = Date.now();
		let malchusSnapshot = await this.session.evidence.snapshot();
		while (Date.now() < netzachDeadline) {
			malchusSnapshot = await this.visibility.ensureRunning(malchusSnapshot);
			if (malchusSnapshot.state?.status !== "running") {
				break;
			}
			this.observeObstacles(malchusSnapshot.diagnostics?.obstacles || []);
			const tiferesDecision = choosePlaythroughDecision(malchusSnapshot);
			if (tiferesDecision && this.shouldAct(tiferesDecision)) {
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
			terminalState:malchusSnapshot.state,
			families:[...this.encounteredFamilies],
			laws:[...this.encounteredLaws],
			movingVariants:[...this.movingVariants]
		});
	}

	/**
	 * @description Accumulates themed family, collision-law, and moving-hazard coverage from active obstacle evidence.
	 * @param {Array<object>} gevurahObstacles Bounded public obstacle records.
	 * @returns {void}
	 */
	observeObstacles(gevurahObstacles) {
		for (const gevurahObstacle of gevurahObstacles) {
			this.encounteredFamilies.add(gevurahObstacle.family);
			this.encounteredLaws.add(gevurahObstacle.law);
			if (
				gevurahObstacle.motionMode
				&& gevurahObstacle.motionMode !== "static"
			) {
				this.movingVariants.add(gevurahObstacle.variantId);
			}
		}
	}

	/**
	 * @description Suppresses duplicate commands during one encounter while allowing a recycled semantic obstacle to be handled later.
	 * @param {object} tiferesDecision Proposed command decision with obstacle evidence.
	 * @returns {boolean} True when this decision key's cooldown has expired.
	 */
	shouldAct(tiferesDecision) {
		const gevurahObstacle = tiferesDecision.obstacle;
		const yesodKey = [
			gevurahObstacle.variantId,
			gevurahObstacle.lane,
			tiferesDecision.command
		].join(":");
		const netzachNow = Date.now();
		const netzachPrevious = this.lastActionAt.get(yesodKey) || 0;
		if (netzachNow - netzachPrevious < ACTION_COOLDOWN_MS) {
			return false;
		}
		this.lastActionAt.set(yesodKey, netzachNow);
		return true;
	}
}
