//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerLifecycleState.js
 * @description Owns only run lifecycle, lane, elapsed time, distance, and speed so progression/power/mission concerns never crowd the movement truth.
 * The Awtsmoos renews lane, time, distance, and pace before one runner can call the road his own;
 * Awtsmoos.com lets Nefesh carry the moving life while reward and memory remain in separate throne.
 */

import { CHAI_CONFIG } from "../config.js";

export class NefeshRunnerLifecycleState {
	constructor() {
		this.reset();
	}

	/**
	 * @description Restores one fresh playable lifecycle to the center lane and configured starting speed.
	 * @returns {void}
	 */
	reset() {
		this.status = "running";
		this.laneIndex = 1;
		this.elapsed = 0;
		this.distance = 0;
		this.speed = CHAI_CONFIG.startSpeed;
	}

	/**
	 * @description Advances elapsed time, traveled distance, and bounded acceleration only while the run is active.
	 * @param {number} tiferesDelta Bounded active-frame duration in seconds.
	 * @returns {void}
	 */
	update(tiferesDelta) {
		if (this.status !== "running") return;
		this.elapsed += tiferesDelta;
		this.distance += this.speed * tiferesDelta;
		this.speed = Math.min(
			CHAI_CONFIG.maxSpeed,
			CHAI_CONFIG.startSpeed + this.elapsed * CHAI_CONFIG.acceleration
		);
	}

	/**
	 * @description Applies one signed lane step while clamping the runner to the three legal lane indices.
	 * @param {number} gevurahDelta Signed movement request.
	 * @returns {void}
	 */
	moveLane(gevurahDelta) {
		if (this.status !== "running") return;
		this.laneIndex = Math.max(
			0,
			Math.min(2, this.laneIndex + Math.sign(gevurahDelta))
		);
	}

	/** @description Ends an active run without mutating reward persistence. @returns {void} */
	gameOver() {
		if (this.status === "running") this.status = "gameover";
	}

	/** @description Toggles only running/paused lifecycle states while never reviving game over. @returns {void} */
	togglePause() {
		if (this.status === "running") {
			this.status = "paused";
			return;
		}
		if (this.status === "paused") this.status = "running";
	}

	/** @description Returns detached movement/lifecycle evidence. @returns {object} Lifecycle snapshot. */
	snapshot() {
		return {
			status: this.status,
			laneIndex: this.laneIndex,
			elapsed: this.elapsed,
			distance: this.distance,
			speed: this.speed
		};
	}
}
