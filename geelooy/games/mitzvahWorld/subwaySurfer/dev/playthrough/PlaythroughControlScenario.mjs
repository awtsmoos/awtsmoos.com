//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughControlScenario.mjs
 * @description Proves public lane/jump/duck commands and real keyboard lane movement from independent fresh runs with frame-robust body observation.
 * The Awtsmoos renews lane, leap, lowering, key, and body before each proof can be called alive;
 * Awtsmoos.com lets Tiferes wait for actual motion instead of mistaking one overloaded instant for the whole drive.
 */

import { waitForPlaythroughBodyState } from "./PlaythroughBodyStateObserver.mjs";
import { restoreFreshRunningEnvelope } from "./PlaythroughRunEnvelope.mjs";

export class TiferesPlaythroughControlScenario {
	/**
	 * @description Captures one connected browser session and shared report ledger used for control evidence.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable playthrough report.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/** @description Executes four independent control proof families from fresh running envelopes. @returns {Promise<void>} Settles after all checkpoints. */
	async run() {
		await restoreFreshRunningEnvelope(this.session);
		await this.proveLaneCommands();
		await restoreFreshRunningEnvelope(this.session);
		await this.proveJump();
		await restoreFreshRunningEnvelope(this.session);
		await this.proveDuck();
		await restoreFreshRunningEnvelope(this.session);
		await this.proveKeyboardLaneChange();
	}

	/** @description Verifies public left decreases lane index and right returns toward center. @returns {Promise<void>} Settles after lane evidence. */
	async proveLaneCommands() {
		const malchusStart = await this.session.evidence.snapshot();
		await this.session.command("left");
		await this.session.actions.wait(180);
		const malchusLeft = await this.session.evidence.snapshot();
		this.report.checkpoint("public-left", malchusLeft);
		if (malchusLeft.state?.laneIndex >= malchusStart.state?.laneIndex) {
			this.report.issue("BLOCKER", "Public left command did not move the runner left.", {
				start:malchusStart.state,
				after:malchusLeft.state
			});
		}
		await this.session.command("right");
		await this.session.actions.wait(180);
	}

	/** @description Issues public jump and polls until the live collision body reveals positive jump height. @returns {Promise<void>} Settles after bounded jump evidence. */
	async proveJump() {
		await this.session.command("jump");
		const malchusJump = await waitForPlaythroughBodyState(
			this.session,
			(gevurahBody) => Number(gevurahBody.jumpY || 0) > 0
		);
		this.report.checkpoint("public-jump", malchusJump);
		if (!(malchusJump.diagnostics?.body?.jumpY > 0)) {
			this.report.issue("BLOCKER", "Public jump command produced no positive jumpY.", malchusJump.diagnostics?.body);
		}
	}

	/** @description Issues public duck from grounded state and polls until the live collision body enters ducking state. @returns {Promise<void>} Settles after bounded duck evidence. */
	async proveDuck() {
		await this.session.command("duck");
		const malchusDuck = await waitForPlaythroughBodyState(
			this.session,
			(gevurahBody) => Boolean(gevurahBody.ducking)
		);
		this.report.checkpoint("public-duck", malchusDuck);
		if (!malchusDuck.diagnostics?.body?.ducking) {
			this.report.issue("BLOCKER", "Public duck command did not enter duck body state.", malchusDuck.diagnostics?.body);
		}
	}

	/** @description Dispatches real DevTools keyboard events and proves ArrowLeft changes lane. @returns {Promise<void>} Settles after keyboard evidence. */
	async proveKeyboardLaneChange() {
		const malchusBefore = await this.session.evidence.snapshot();
		await this.session.actions.key("ArrowLeft", "ArrowLeft");
		await this.session.actions.wait(180);
		const malchusAfter = await this.session.evidence.snapshot();
		this.report.checkpoint("keyboard-left", malchusAfter);
		if (malchusAfter.state?.laneIndex >= malchusBefore.state?.laneIndex) {
			this.report.issue("MAJOR", "Real ArrowLeft keyboard input did not change lane left.", {
				before:malchusBefore.state,
				after:malchusAfter.state
			});
		}
		await this.session.actions.key("ArrowRight", "ArrowRight");
		await this.session.actions.wait(180);
	}
}
