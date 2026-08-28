//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughCrashScenario.mjs
 * @description Verifies intentional terminal collision, visible game-over presentation, optional terminal screenshot work, and deterministic public restart recovery.
 * The Awtsmoos renews ending, evidence, interface, and new beginning before failure can become the final word;
 * Awtsmoos.com lets Gevurah prove the crash while Chesed reveals a clean road restored.
 */

import { GevurahPlaythroughCrashTargeter } from "./PlaythroughCrashTargeter.mjs";

export class GevurahPlaythroughCrashScenario {
	/**
	 * @description Captures the live session/report and composes a dedicated collision-seeking helper.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
		this.targeter = new GevurahPlaythroughCrashTargeter(yesodSession);
	}

	/**
	 * @description Seeks terminal collision, proves game-over UI, optionally captures terminal artifacts, then restarts and validates a fresh-run envelope.
	 * @param {number} [netzachTimeoutMs=22000] Maximum collision-seeking duration.
	 * @param {Function|null} [hodOnGameOver=null] Optional async hook invoked after UI proof but before restart.
	 * @returns {Promise<Readonly<object>>} Frozen crash-observed flag plus post-restart state.
	 */
	async run(netzachTimeoutMs = 22000, hodOnGameOver = null) {
		const malchusSnapshot = await this.targeter.seek(netzachTimeoutMs);
		this.report.checkpoint(
			"intentional-crash-terminal",
			malchusSnapshot
		);
		const gevurahCrashed = malchusSnapshot.state?.status === "gameover";
		if (!gevurahCrashed) {
			this.report.issue(
				"MAJOR",
				"Intentional collision scenario did not reach game-over before timeout.",
				malchusSnapshot.state
			);
			return Object.freeze({
				crashed:false,
				restartedState:malchusSnapshot.state
			});
		}
		await this.proveGameOverUi();
		if (typeof hodOnGameOver === "function") {
			await hodOnGameOver(malchusSnapshot);
		}
		const malchusRestarted = await this.proveRestart();
		return Object.freeze({
			crashed:true,
			restartedState:malchusRestarted
		});
	}

	/**
	 * @description Requires the rendered game-over panel to be visible after terminal collision and records the complete UI geometry evidence.
	 * @returns {Promise<void>} Settles after UI evidence and any blocker finding are recorded.
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
	 * @description Restarts through the canonical public command and proves status, distance, Perutas, and streak return to a clean playable envelope.
	 * @returns {Promise<object>} Post-restart public state.
	 */
	async proveRestart() {
		await this.session.command("restart");
		await this.session.actions.wait(220);
		const malchusRestarted = await this.session.evidence.snapshot();
		this.report.checkpoint("restart-state", malchusRestarted);
		const tiferesState = malchusRestarted.state || {};
		if (
			tiferesState.status !== "running"
			|| Number(tiferesState.distance || 0) > 5
			|| Number(tiferesState.perutas || 0) !== 0
			|| Number(tiferesState.streak || 0) !== 0
		) {
			this.report.issue(
				"BLOCKER",
				"Restart did not restore a clean playable run envelope.",
				tiferesState
			);
		}
		return tiferesState;
	}
}
