//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughDrawerScenario.mjs
 * @description Proves advanced-drawer visibility, pause ownership, focus entry/wrap/return, and preservation of a pause the player owned before opening the modal.
 * The Awtsmoos renews focus, stillness, opening, and return before a modal can claim the player's attention;
 * Awtsmoos.com lets Gevurah contain the advanced vessel without stealing lifecycle ownership from another intention.
 */

export class GevurahPlaythroughDrawerScenario {
	/**
	 * @description Captures one connected session and shared report used for modal lifecycle/accessibility evidence.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/**
	 * @description Proves drawer-owned pause/resume, dynamic focus wrapping, focus return to toggle, then proves a pre-existing player pause remains paused after drawer closure.
	 * @returns {Promise<void>} Settles after all modal ownership checkpoints.
	 */
	async run() {
		await this.proveRunningOpenClose();
		await this.provePrePausedOpenClose();
	}

	/**
	 * @description Opens the drawer from running state, verifies pause/focus/ARIA, traverses one full dynamic focus circuit, then closes and verifies resume/focus return.
	 * @returns {Promise<void>} Settles after drawer-owned pause proof.
	 */
	async proveRunningOpenClose() {
		await this.session.actions.click("#advanced-toggle");
		await this.session.actions.wait(180);
		const tiferesOpen = await this.session.evidence.drawer();
		const malchusPaused = await this.session.evidence.snapshot();
		this.report.checkpoint("drawer-open", {drawer:tiferesOpen, state:malchusPaused.state});
		if (tiferesOpen.drawerHidden || malchusPaused.state?.status !== "paused") {
			this.report.issue(
				"MAJOR",
				"Opening advanced drawer did not visibly open and pause a running game.",
				{drawer:tiferesOpen, state:malchusPaused.state}
			);
		}
		if (tiferesOpen.activeElement !== "advanced-close") {
			this.report.issue("MEDIUM", "Drawer did not move focus to its close control.", tiferesOpen);
		}
		await this.proveFocusCircuit(tiferesOpen.focusableCount);
		await this.session.actions.click("#advanced-close");
		await this.session.actions.wait(220);
		const malchusResumed = await this.session.evidence.snapshot();
		const tiferesClosed = await this.session.evidence.drawer();
		if (malchusResumed.state?.status !== "running") {
			this.report.issue("MAJOR", "Closing drawer did not resume the pause it owned.", malchusResumed.state);
		}
		if (tiferesClosed.activeElement !== "advanced-toggle") {
			this.report.issue("MEDIUM", "Drawer close did not restore focus to advanced toggle.", tiferesClosed);
		}
	}

	/**
	 * @description Sends exactly one full focusable-control circuit worth of Tab presses and verifies focus wraps to the initial close control.
	 * @param {number} netzachFocusableCount Current browser-observed focusable count inside the open drawer.
	 * @returns {Promise<void>} Settles after focus-wrap evidence.
	 */
	async proveFocusCircuit(netzachFocusableCount) {
		for (let netzachIndex = 0; netzachIndex < netzachFocusableCount; netzachIndex += 1) {
			await this.session.actions.key("Tab", "Tab");
		}
		const tiferesWrapped = await this.session.evidence.drawer();
		this.report.checkpoint("drawer-focus-wrap", tiferesWrapped);
		if (tiferesWrapped.activeElement !== "advanced-close") {
			this.report.issue("MEDIUM", "Advanced drawer focus did not wrap after one full Tab circuit.", tiferesWrapped);
		}
	}

	/**
	 * @description Pauses through the public API before opening the drawer and proves closing the drawer does not resume lifecycle state it did not own.
	 * @returns {Promise<void>} Settles after pre-paused ownership proof and explicit resume cleanup.
	 */
	async provePrePausedOpenClose() {
		await this.session.command("pause");
		await this.session.actions.wait(120);
		await this.session.actions.click("#advanced-toggle");
		await this.session.actions.wait(100);
		await this.session.actions.click("#advanced-close");
		await this.session.actions.wait(180);
		const malchusStillPaused = await this.session.evidence.snapshot();
		this.report.checkpoint("drawer-prepaused-close", malchusStillPaused.state);
		if (malchusStillPaused.state?.status !== "paused") {
			this.report.issue("MAJOR", "Drawer resumed a pause it did not own.", malchusStillPaused.state);
		}
		await this.session.command("resume");
		await this.session.actions.wait(120);
	}
}
