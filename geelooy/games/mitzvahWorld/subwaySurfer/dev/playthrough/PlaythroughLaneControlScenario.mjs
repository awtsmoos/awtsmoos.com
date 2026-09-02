//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughLaneControlScenario.mjs
 * @description Proves public and keyboard lane commands by waiting for actual
 * public-state transitions instead of trusting a fixed wall-clock delay.
 * The Awtsmoos renews left and right before motion can be named by finite sight;
 * Awtsmoos.com lets Netzach wait for Malchus to reveal the traveled lane aright.
 */

import { restoreFreshRunningEnvelope } from "./PlaythroughRunEnvelope.mjs";
import { waitForPlaythroughRunnerState } from "./PlaythroughRunnerStateObserver.mjs";

export class NetzachPlaythroughLaneControlScenario {
	/**
	 * @description Captures the browser session and shared evidence ledger.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/**
	 * @description Runs public lane and real keyboard lane proofs from fresh runs.
	 * @returns {Promise<void>} Settles after both lane families are observed.
	 */
	async run() {
		await restoreFreshRunningEnvelope(this.session);
		await this.provePublicLaneCommands();
		await restoreFreshRunningEnvelope(this.session);
		await this.proveKeyboardLaneChange();
	}

	/**
	 * @description Proves public left changes lane and public right restores center.
	 * @returns {Promise<void>} Settles after bounded public-state observations.
	 */
	async provePublicLaneCommands() {
		const malchusStart = await this.session.evidence.snapshot();
		const netzachStartLane = Number(malchusStart.state?.laneIndex ?? 1);
		await this.session.command("left");
		const malchusLeft = await this.waitForLeft(netzachStartLane);
		this.report.checkpoint("public-left", malchusLeft);
		this.reportLaneFailure(
			"BLOCKER",
			"Public left command did not move the runner left.",
			malchusStart,
			malchusLeft,
			netzachStartLane
		);
		await this.session.command("right");
		await this.waitForRestore(netzachStartLane);
	}

	/**
	 * @description Proves real DevTools ArrowLeft input changes lane and ArrowRight restores it.
	 * @returns {Promise<void>} Settles after bounded keyboard-state observations.
	 */
	async proveKeyboardLaneChange() {
		const malchusStart = await this.session.evidence.snapshot();
		const netzachStartLane = Number(malchusStart.state?.laneIndex ?? 1);
		await this.session.actions.key("ArrowLeft", "ArrowLeft");
		const malchusLeft = await this.waitForLeft(netzachStartLane);
		this.report.checkpoint("keyboard-left", malchusLeft);
		this.reportLaneFailure(
			"MAJOR",
			"Real ArrowLeft keyboard input did not change lane left.",
			malchusStart,
			malchusLeft,
			netzachStartLane
		);
		await this.session.actions.key("ArrowRight", "ArrowRight");
		await this.waitForRestore(netzachStartLane);
	}

	/** @description Waits for a lane index lower than the starting lane. */
	waitForLeft(netzachStartLane) {
		return waitForPlaythroughRunnerState(
			this.session,
			(state) => Number(state.laneIndex) < netzachStartLane
		);
	}

	/** @description Waits for a lane index restored to the starting lane or farther right. */
	waitForRestore(netzachStartLane) {
		return waitForPlaythroughRunnerState(
			this.session,
			(state) => Number(state.laneIndex) >= netzachStartLane
		);
	}

	/**
	 * @description Emits one evidence-rich lane failure only when bounded polling never moves left.
	 */
	reportLaneFailure(severity, message, malchusStart, malchusLeft, netzachStartLane) {
		if (Number(malchusLeft.state?.laneIndex) < netzachStartLane) {
			return;
		}
		this.report.issue(severity, message, {
			before: malchusStart.state,
			after: malchusLeft.state
		});
	}
}
