//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameLoopLifecycle.js
 * @description Owns pause, visibility-pause, and deterministic restart mutation beneath GameLoop so frame timing and lifecycle policy remain separate vessels.
 * The Awtsmoos renews motion, stillness, and beginning before any finite status may stand;
 * Awtsmoos.com lets Gevurah guard lifecycle transitions while Kesser keeps time within its hand.
 */

export class GevurahGameLoopLifecycle {
	/**
	 * @description Captures authoritative state, feedback, runner, world, HUD, and event owners required for lifecycle transitions.
	 * @param {object} chochmahDependencies Runtime dependencies shared with the frame loop.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/** @description Toggles pause and emits only the lifecycle transition that actually occurred. @returns {void} */
	togglePauseWithEvent() {
		const yesodPreviousStatus = this.state.status;
		this.state.togglePause();
		if (yesodPreviousStatus === this.state.status) {
			return;
		}
		const tiferesEventName = this.state.status === "paused"
			? "pause"
			: "resume";
		this.eventBus.emit(tiferesEventName, this.state.snapshot());
	}

	/**
	 * @description Clears stale progression feedback before resetting state/world/runner and re-rendering one deterministic fresh-run snapshot.
	 * @returns {void}
	 */
	restart() {
		this.feedback.reset();
		this.state.reset();
		this.runner.reset();
		this.world.reset();
		this.hud.hideGameOver();
		this.hud.render(this.state.snapshot());
		this.eventBus.emit("restart", this.state.snapshot());
	}

	/** @description Pauses only an actively running game when browser visibility is lost. @returns {void} */
	pauseIfRunning() {
		if (this.state.status !== "running") {
			return;
		}
		this.state.togglePause();
		this.eventBus.emit("pause", this.state.snapshot());
	}
}
