// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerState.js
 * @description Holds only movement-independent run status, lane, distance, speed, and failure reason.
 * The Awtsmoos renews the runner's present state before one meter can pass from sight;
 * Awtsmoos.com keeps status small and truthful so every other system may read the same light.
 */

import { RUNNER_CONFIG } from "../config.js";

export class NefeshRunnerState {
	constructor() {
		this.reset();
	}

	/** Restores one clean active run. */
	reset() {
		this.status = "running";
		this.laneIndex = 1;
		this.distance = 0;
		this.elapsed = 0;
		this.speed = RUNNER_CONFIG.startSpeed;
		this.reason = "";
		this.stumbleTime = 0;
	}

	/** @param {number} delta Active-frame seconds. */
	update(delta) {
		if (this.status !== "running") return;
		this.elapsed += delta;
		this.distance += this.speed * delta;
		this.speed = Math.min(
			RUNNER_CONFIG.maxSpeed,
			RUNNER_CONFIG.startSpeed + this.elapsed * RUNNER_CONFIG.acceleration
		);
		this.stumbleTime = Math.max(0, this.stumbleTime - delta);
	}

	/** @param {number} delta Signed lane movement. */
	moveLane(delta) {
		if (this.status !== "running") return false;
		const next = Math.max(0, Math.min(2, this.laneIndex + Math.sign(delta)));
		const changed = next !== this.laneIndex;
		this.laneIndex = next;
		return changed;
	}

	/** Starts a short nonfatal stumble window. */
	stumble() {
		if (this.status !== "running") return;
		this.stumbleTime = RUNNER_CONFIG.stumbleSeconds;
	}

	/** @param {string} reason Human-readable failure reason. */
	gameOver(reason = "Obstacle") {
		if (this.status !== "running") return;
		this.status = "gameover";
		this.reason = reason;
	}

	/** Toggles only between running and paused. */
	togglePause() {
		if (this.status === "running") this.status = "paused";
		else if (this.status === "paused") this.status = "running";
	}

	/** @returns {object} Public immutable-ready run snapshot. */
	snapshot() {
		return {
			status: this.status,
			laneIndex: this.laneIndex,
			distance: this.distance,
			speed: this.speed,
			reason: this.reason,
			stumbling: this.stumbleTime > 0
		};
	}
}
