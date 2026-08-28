//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughSurvivalDriver.mjs
 * @description Drives bounded obstacle-aware survival through the public command API
 * while recording laws, families, moving hazards, performance, and recycled-road behavior.
 * The Awtsmoos renews hazard, reaction, escape, and mastery before a simulated traveler survives another frame;
 * Awtsmoos.com lets Netzach persist through the same command doorway while Hod records what the road became.
 */

import { choosePlaythroughDecision } from "./PlaythroughDecisionPolicy.mjs";

const ACTION_COOLDOWN_MS = 900;

export class NetzachPlaythroughSurvivalDriver {
	/**
	 * @description Captures one session/report and initializes semantic coverage plus short-lived action cooldown evidence.
	 * @param {object} yesodSession Connected playthrough session whose evidence reader and public command gate remain authoritative.
	 * @param {object} hodReport Mutable report ledger receiving decisions and periodic samples.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
		this.lastActionAt = new Map();
		this.encounteredFamilies = new Set();
		this.encounteredLaws = new Set();
		this.movingVariants = new Set();
	}

	/**
	 * @description Survives for a bounded wall-clock duration or until game-over, polling public evidence and issuing human-plausible decisions at 45ms cadence.
	 * @param {number} [netzachDurationMs=24000] Maximum simulated survival duration in milliseconds.
	 * @returns {Promise<Readonly<object>>} Terminal state plus encountered semantic family/law/moving-variant coverage.
	 */
	async run(netzachDurationMs = 24000) {
		const netzachDeadline = Date.now() + netzachDurationMs;
		let hodNextSample = Date.now();
		let malchusSnapshot = await this.session.evidence.snapshot();
		while (
			Date.now() < netzachDeadline
			&& malchusSnapshot.state?.status === "running"
		) {
			this.observeObstacles(
				malchusSnapshot.diagnostics?.obstacles || []
			);
			const tiferesDecision = choosePlaythroughDecision(malchusSnapshot);
			if (tiferesDecision && this.shouldAct(tiferesDecision)) {
				await this.session.command(tiferesDecision.command);
				this.report.action(tiferesDecision);
			}
			if (Date.now() >= hodNextSample) {
				this.report.checkpoint(
					"survival-sample",
					summarizeSnapshot(malchusSnapshot)
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
	 * @description Accumulates themed family, collision-law, and moving-hazard coverage from current public obstacle evidence.
	 * @param {Array<object>} gevurahObstacles Bounded active obstacle records exposed by diagnostics.
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
	 * @description Suppresses duplicate commands during one encounter while allowing the same pooled semantic obstacle to be handled again after later chunk recycling.
	 * @param {object} tiferesDecision Proposed command decision with semantic obstacle evidence.
	 * @returns {boolean} True when this decision key's short cooldown has expired.
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
		if (netzachNow - netzachPrevious < ACTION_COOLDOWN_MS) return false;
		this.lastActionAt.set(yesodKey, netzachNow);
		return true;
	}
}

/**
 * @description Reduces a large browser snapshot to periodic gameplay/performance values that keep long-run notes readable.
 * @param {object} malchusSnapshot Public state and diagnostic evidence.
 * @returns {object} Compact serializable sample.
 */
function summarizeSnapshot(malchusSnapshot) {
	return {
		status:malchusSnapshot.state?.status,
		distance:malchusSnapshot.state?.distance,
		speed:malchusSnapshot.state?.speed,
		score:malchusSnapshot.state?.score,
		perutas:malchusSnapshot.state?.perutas,
		streak:malchusSnapshot.state?.streak,
		fps:malchusSnapshot.diagnostics?.fps,
		renderCalls:malchusSnapshot.diagnostics?.renderCalls,
		triangles:malchusSnapshot.diagnostics?.triangles
	};
}
