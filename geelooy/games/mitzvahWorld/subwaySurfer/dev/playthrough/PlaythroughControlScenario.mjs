//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughControlScenario.mjs
 * @description Coordinates independent lane, jump, and duck proof vessels without
 * coupling lane timing to collision-body timing.
 * The Awtsmoos renews lane, leap, and lowering before each finite witness can arrive;
 * Awtsmoos.com lets Tiferes join separate proofs so every control remains alive.
 */

import { waitForPlaythroughBodyState } from "./PlaythroughBodyStateObserver.mjs";
import { NetzachPlaythroughLaneControlScenario } from "./PlaythroughLaneControlScenario.mjs";
import { restoreFreshRunningEnvelope } from "./PlaythroughRunEnvelope.mjs";

export class TiferesPlaythroughControlScenario {
	/**
	 * @description Captures session/report ownership and creates the lane-proof vessel.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
		this.lanes = new NetzachPlaythroughLaneControlScenario(
			yesodSession,
			hodReport
		);
	}

	/**
	 * @description Executes lane, jump, and duck proof families from fresh runs.
	 * @returns {Promise<void>} Settles after all public/keyboard controls are observed.
	 */
	async run() {
		await this.lanes.run();
		await restoreFreshRunningEnvelope(this.session);
		await this.proveJump();
		await restoreFreshRunningEnvelope(this.session);
		await this.proveDuck();
	}

	/**
	 * @description Issues public jump and waits for positive collision-body height.
	 * @returns {Promise<void>} Settles after bounded jump evidence.
	 */
	async proveJump() {
		await this.session.command("jump");
		const malchusJump = await waitForPlaythroughBodyState(
			this.session,
			(gevurahBody) => Number(gevurahBody.jumpY || 0) > 0
		);
		this.report.checkpoint("public-jump", malchusJump);
		if (malchusJump.diagnostics?.body?.jumpY > 0) {
			return;
		}
		this.report.issue(
			"BLOCKER",
			"Public jump command produced no positive jumpY.",
			malchusJump.diagnostics?.body
		);
	}

	/**
	 * @description Issues public duck and waits until collision evidence is ducking.
	 * @returns {Promise<void>} Settles after bounded duck evidence.
	 */
	async proveDuck() {
		await this.session.command("duck");
		const malchusDuck = await waitForPlaythroughBodyState(
			this.session,
			(gevurahBody) => Boolean(gevurahBody.ducking)
		);
		this.report.checkpoint("public-duck", malchusDuck);
		if (malchusDuck.diagnostics?.body?.ducking) {
			return;
		}
		this.report.issue(
			"BLOCKER",
			"Public duck command did not enter duck body state.",
			malchusDuck.diagnostics?.body
		);
	}
}
