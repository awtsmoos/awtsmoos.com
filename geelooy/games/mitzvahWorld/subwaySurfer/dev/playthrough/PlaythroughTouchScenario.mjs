//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughTouchScenario.mjs
 * @description Proves mobile jump, duck, and joystick lane movement through real DevTools touch contacts with bounded body-state observation.
 * The Awtsmoos renews hand and runner as one lawful meeting before intent becomes motion in the street;
 * Awtsmoos.com lets Hod witness touch itself across real frames, not a shortcut or one overloaded instant's deceit.
 */

import { waitForPlaythroughBodyState } from "./PlaythroughBodyStateObserver.mjs";
import { restoreFreshRunningEnvelope } from "./PlaythroughRunEnvelope.mjs";
import { NetzachPlaythroughTouchActions } from "./PlaythroughTouchActions.mjs";

export class HodPlaythroughTouchScenario {
	/**
	 * @description Captures one mobile session, report ledger, and dedicated physical touch dispatcher.
	 * @param {object} yesodSession Connected mobile playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
		this.touch = new NetzachPlaythroughTouchActions(yesodSession.cdp);
	}

	/** @description Runs independently reset touch proofs for jump, duck, and joystick lane movement. @returns {Promise<void>} Settles after every touch checkpoint. */
	async run() {
		await this.proveJump();
		await this.proveDuck();
		await this.proveJoystick();
	}

	/** @description Taps the visible jump button and waits for positive collision-body jump height. @returns {Promise<void>} Settles after bounded jump evidence. */
	async proveJump() {
		await restoreFreshRunningEnvelope(this.session);
		await this.touch.tap("#jump-button");
		const malchusJump = await waitForPlaythroughBodyState(
			this.session,
			(gevurahBody) => Number(gevurahBody.jumpY || 0) > 0
		);
		this.report.checkpoint("touch-jump", malchusJump);
		if (!(malchusJump.diagnostics?.body?.jumpY > 0)) {
			this.report.issue("BLOCKER", "Touch jump button produced no positive jumpY.", malchusJump.diagnostics?.body);
		}
		await this.session.actions.wait(760);
	}

	/** @description Taps the visible duck button and waits for the bounded duck collision state. @returns {Promise<void>} Settles after duck recovery. */
	async proveDuck() {
		await restoreFreshRunningEnvelope(this.session);
		await this.touch.tap("#duck-button");
		const malchusDuck = await waitForPlaythroughBodyState(
			this.session,
			(gevurahBody) => Boolean(gevurahBody.ducking)
		);
		this.report.checkpoint("touch-duck", malchusDuck);
		if (!malchusDuck.diagnostics?.body?.ducking) {
			this.report.issue("BLOCKER", "Touch duck button did not enter duck body state.", malchusDuck.diagnostics?.body);
		}
		await this.session.actions.wait(760);
	}

	/** @description Drags the joystick 34 CSS pixels left, beyond its 22px lane threshold, and proves lane index decreases. @returns {Promise<void>} Settles after lane evidence. */
	async proveJoystick() {
		const malchusBefore = await restoreFreshRunningEnvelope(this.session);
		await this.touch.drag("#joystick", -34);
		await this.session.actions.wait(180);
		const malchusAfter = await this.session.evidence.snapshot();
		this.report.checkpoint("touch-joystick-left", malchusAfter);
		if (malchusAfter.state?.laneIndex >= malchusBefore.state?.laneIndex) {
			this.report.issue("BLOCKER", "Touch joystick drag did not move the runner left.", {
				before:malchusBefore.state,
				after:malchusAfter.state
			});
		}
	}
}
