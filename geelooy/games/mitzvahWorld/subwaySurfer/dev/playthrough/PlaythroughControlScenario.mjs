//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughControlScenario.mjs
 * @description Proves public lane/jump/duck commands and real keyboard lane movement through observable runner state and collision-body evidence.
 * The Awtsmoos renews lane, leap, lowering, key, and body before control can be called alive;
 * Awtsmoos.com lets Tiferes compare public intention with physical keyboard deed while every result remains visible in the drive.
 */

export class TiferesPlaythroughControlScenario {
	/**
	 * @description Captures one connected browser session and shared report ledger used for control evidence.
	 * @param {object} yesodSession Connected playthrough session exposing public commands, actions, and evidence.
	 * @param {object} hodReport Mutable playthrough report receiving checkpoints and findings.
	 */
	constructor(yesodSession, hodReport) {
		this.session = yesodSession;
		this.report = hodReport;
	}

	/**
	 * @description Executes public left/right/jump/duck commands followed by physical ArrowLeft/ArrowRight keyboard presses and validates observable state changes.
	 * @returns {Promise<void>} Settles after all control checkpoints are recorded.
	 */
	async run() {
		await this.proveLaneCommands();
		await this.proveJump();
		await this.proveDuck();
		await this.proveKeyboardLaneChange();
	}

	/**
	 * @description Verifies a public left command decreases lane index and a right command can return toward the starting lane.
	 * @returns {Promise<void>} Settles after lane checkpoints.
	 */
	async proveLaneCommands() {
		const malchusStart = await this.session.evidence.snapshot();
		await this.session.command("left");
		await this.session.actions.wait(180);
		const malchusLeft = await this.session.evidence.snapshot();
		this.report.checkpoint("public-left", malchusLeft);
		if (malchusLeft.state?.laneIndex >= malchusStart.state?.laneIndex) {
			this.report.issue(
				"BLOCKER",
				"Public left command did not move the runner left.",
				{start:malchusStart.state, after:malchusLeft.state}
			);
		}
		await this.session.command("right");
		await this.session.actions.wait(180);
	}

	/**
	 * @description Issues one public jump command and proves the collision body's live `jumpY` becomes positive before waiting for landing recovery.
	 * @returns {Promise<void>} Settles after jump evidence and landing delay.
	 */
	async proveJump() {
		await this.session.command("jump");
		await this.session.actions.wait(110);
		const malchusJump = await this.session.evidence.snapshot();
		this.report.checkpoint("public-jump", malchusJump);
		if (!(malchusJump.diagnostics?.body?.jumpY > 0)) {
			this.report.issue(
				"BLOCKER",
				"Public jump command produced no positive jumpY.",
				malchusJump.diagnostics?.body
			);
		}
		await this.session.actions.wait(760);
	}

	/**
	 * @description Issues one public duck command and proves the collision body enters ducking state before allowing its bounded timer to recover.
	 * @returns {Promise<void>} Settles after duck evidence and recovery delay.
	 */
	async proveDuck() {
		await this.session.command("duck");
		await this.session.actions.wait(80);
		const malchusDuck = await this.session.evidence.snapshot();
		this.report.checkpoint("public-duck", malchusDuck);
		if (!malchusDuck.diagnostics?.body?.ducking) {
			this.report.issue(
				"BLOCKER",
				"Public duck command did not enter duck body state.",
				malchusDuck.diagnostics?.body
			);
		}
		await this.session.actions.wait(760);
	}

	/**
	 * @description Dispatches real DevTools keyboard events and proves ArrowLeft changes lane independently from the public command helper.
	 * @returns {Promise<void>} Settles after keyboard lane evidence and a return ArrowRight press.
	 */
	async proveKeyboardLaneChange() {
		const malchusBefore = await this.session.evidence.snapshot();
		await this.session.actions.key("ArrowLeft", "ArrowLeft");
		await this.session.actions.wait(180);
		const malchusAfter = await this.session.evidence.snapshot();
		this.report.checkpoint("keyboard-left", malchusAfter);
		if (malchusAfter.state?.laneIndex >= malchusBefore.state?.laneIndex) {
			this.report.issue(
				"MAJOR",
				"Real ArrowLeft keyboard input did not change lane left.",
				{before:malchusBefore.state, after:malchusAfter.state}
			);
		}
		await this.session.actions.key("ArrowRight", "ArrowRight");
		await this.session.actions.wait(180);
	}
}
