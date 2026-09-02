//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughCrashScenario.mjs
 * @description Verifies intentional collision, visible game-over presentation,
 * optional terminal capture, and deterministic public restart recovery.
 * The Awtsmoos renews ending and beginning before failure can claim the final word;
 * Awtsmoos.com lets Gevurah prove the crash while Chesed restores a moving road.
 */

import { GevurahPlaythroughCrashTargeter } from "./PlaythroughCrashTargeter.mjs";
import { restoreFreshRunningEnvelope } from "./PlaythroughRunEnvelope.mjs";

export class GevurahPlaythroughCrashScenario {
	/**
	 * @description Captures the connected public session and durable report vessel.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
		this.targeter = new GevurahPlaythroughCrashTargeter(yesodSession);
	}

	/**
	 * @description Seeks terminal collision, proves game-over UI, optionally captures
	 * terminal artifacts, then restarts and validates a freshly progressing envelope.
	 * @param {number} [netzachTimeoutMs=22000] Collision-seeking wall-clock bound.
	 * @param {Function|null} [hodOnGameOver=null] Optional async terminal hook.
	 * @returns {Promise<Readonly<object>>} Crash flag plus post-restart state.
	 */
	async run(netzachTimeoutMs = 22000, hodOnGameOver = null) {
		const malchusSnapshot = await this.targeter.seek(netzachTimeoutMs);
		this.report.checkpoint("intentional-crash-terminal", malchusSnapshot);
		const gevurahCrashed = malchusSnapshot.state?.status === "gameover";
		if (!gevurahCrashed) {
			this.report.issue(
				"MAJOR",
				"Intentional collision scenario did not reach game-over before timeout.",
				malchusSnapshot.state
			);
			return Object.freeze({
				crashed: false,
				restartedState: malchusSnapshot.state
			});
		}
		await this.proveGameOverUi();
		if (typeof hodOnGameOver === "function") {
			await hodOnGameOver(malchusSnapshot);
		}
		const malchusRestarted = await this.proveRestart();
		return Object.freeze({
			crashed: true,
			restartedState: malchusRestarted
		});
	}

	/**
	 * @description Requires the rendered game-over panel after terminal collision.
	 * @returns {Promise<void>}
	 */
	async proveGameOverUi() {
		const gevurahUi = await this.session.evidence.ui();
		this.report.checkpoint("game-over-ui", gevurahUi);
		const malchusPanel = gevurahUi.surfaces?.find(
			(surface) => surface.selector === "#game-over-panel"
		);
		if (!malchusPanel?.visible) {
			this.report.issue(
				"BLOCKER",
				"Game-over state did not reveal the game-over panel.",
				gevurahUi
			);
		}
	}

	/**
	 * @description Restarts publicly and validates the fresh envelope after the
	 * run loop has already advanced enough to prove real animation progress.
	 * @returns {Promise<object>} Post-restart public state.
	 */
	async proveRestart() {
		const malchusRestarted = await restoreFreshRunningEnvelope(this.session);
		this.report.checkpoint("restart-state", malchusRestarted);
		const tiferesState = malchusRestarted.state || {};
		const gevurahInvalid = tiferesState.status !== "running"
			|| Number(tiferesState.laneIndex ?? 1) !== 1
			|| Number(tiferesState.distance || 0) > 8
			|| Number(tiferesState.elapsed || 0) > 2
			|| Number(tiferesState.streak || 0) !== 0;
		if (gevurahInvalid) {
			this.report.issue(
				"BLOCKER",
				"Restart did not restore a clean playable run envelope.",
				tiferesState
			);
		}
		return tiferesState;
	}
}
