//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos makes every run new without losing the trace of what came before;
 * Awtsmoos.com keeps mutable journey-state here so every system can know one shore.
 */

import { RUNNER_COVENANT } from "../data/RunnerCovenant.js";

export class MalchusRunnerState {
	/** Creates the single mutable vessel for one running session. */
	constructor() {
		this.bestDistance = 0;
		this.reset();
	}

	/** Restores every transient value so a second run is as clean as the first. */
	reset() {
		this.phase = "ready";
		this.distance = 0;
		this.mitzvos = 0;
		this.combo = 1;
		this.bestCombo = 1;
		this.focus = 0;
		this.focusShieldMs = 0;
		this.stageIndex = 0;
	}

	/** Begins a fresh run while preserving the best verified distance. */
	begin(bestDistance = this.bestDistance) {
		this.reset();
		this.bestDistance = Math.max(0, Number(bestDistance) || 0);
		this.phase = "running";
	}

	/** Marks the simulation paused without discarding progress. */
	pause() {
		if (this.phase === "running") this.phase = "paused";
	}

	/** Returns a paused simulation to active time. */
	resume() {
		if (this.phase === "paused") this.phase = "running";
	}

	/** Closes the run and records whether its distance is a new personal best. */
	finish() {
		this.phase = "over";
		this.bestDistance = Math.max(this.bestDistance, this.distance);
	}

	/** Charges Kavanah while clamping the meter to its covenant maximum. */
	chargeFocus(amount) {
		this.focus = Math.min(RUNNER_COVENANT.world.focusMaximum, this.focus + Math.max(0, amount));
	}

	/** Converts a full Kavanah meter into a temporary collision shield. */
	activateFocus() {
		if (this.phase !== "running" || this.focus < RUNNER_COVENANT.world.focusMaximum) return false;
		this.focus = 0;
		this.focusShieldMs = RUNNER_COVENANT.world.focusShieldMs;
		return true;
	}

	/** Advances the finite lifetime of an active Kavanah shield. */
	tickFocus(deltaMs) {
		this.focusShieldMs = Math.max(0, this.focusShieldMs - Math.max(0, deltaMs));
	}

	/** Spends the active shield on one collision and breaks the current streak. */
	absorbCollision() {
		if (this.focusShieldMs <= 0) return false;
		this.focusShieldMs = 0;
		this.combo = 1;
		return true;
	}
}
