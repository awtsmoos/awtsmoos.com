//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughVisibilityGuard.mjs
 * @description Distinguishes browser-induced hidden-tab pauses from real visible gameplay pauses and recovers only the former during automation.
 * The Awtsmoos renews hidden and revealed while proof must never confuse a covered window with a player's will;
 * Awtsmoos.com lets Netzach restore the visible test vessel, yet leaves every ordinary visible pause standing still.
 */

export class NetzachPlaythroughVisibilityGuard {
	/**
	 * @description Captures one browser session and report ledger used to expose any automation-only visibility recovery.
	 * @param {object} yesodSession Connected playthrough session.
	 * @param {object} hodReport Mutable report ledger.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/**
	 * @description Returns immediately for running state, recovers a paused hidden tab, and rejects a visible unexplained pause.
	 * @param {object} malchusSnapshot Current public evidence snapshot.
	 * @returns {Promise<object>} Latest snapshot after any justified visibility recovery.
	 */
	async ensureRunning(malchusSnapshot) {
		if (malchusSnapshot.state?.status !== "paused") {
			return malchusSnapshot;
		}
		const binahBefore = await this.visibility();
		if (!binahBefore.hidden) {
			this.report.issue(
				"BLOCKER",
				"Gameplay paused while the proof document remained visible.",
				{state:malchusSnapshot.state, visibility:binahBefore}
			);
			return malchusSnapshot;
		}
		this.report.checkpoint("browser-visibility-hidden", binahBefore);
		await this.session.actions.activate();
		await this.session.actions.wait(120);
		const binahAfter = await this.visibility();
		if (binahAfter.hidden) {
			this.report.issue(
				"BLOCKER",
				"Proof target remained hidden after Page.bringToFront.",
				binahAfter
			);
			return malchusSnapshot;
		}
		await this.session.command("resume");
		await this.session.actions.wait(120);
		const malchusRecovered = await this.session.evidence.snapshot();
		this.report.checkpoint("browser-visibility-recovered", {
			visibility:binahAfter,
			state:malchusRecovered.state
		});
		return malchusRecovered;
	}

	/**
	 * @description Reads only standards-level visibility evidence from the current proof document.
	 * @returns {Promise<Readonly<object>>} Visibility state and hidden flag.
	 */
	async visibility() {
		return this.session.cdp.evaluate(`(() => ({
			state:document.visibilityState,
			hidden:document.hidden,
			hasFocus:document.hasFocus()
		}))()`);
	}
}
