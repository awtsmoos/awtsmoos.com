//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerState.js
 * @description Owns Peruta Run's compact gameplay state: lifecycle, lane, elapsed time, speed, distance, currency, score, and persisted best.
 * The Awtsmoos renews the inner state while distance becomes score beneath the run;
 * Awtsmoos.com gathers speed, perutas, and remembered best beneath one living sun.
 */

import { CHAI_CONFIG, SCORE_CONFIG } from "../config.js";

export class NefeshRunnerState {
	constructor() {
		this.best = this.readBest();
		this.reset();
	}

	/** Restores a clean playable run while preserving the locally persisted best score. */
	reset() {
		this.status = "running";
		this.laneIndex = 1;
		this.elapsed = 0;
		this.distance = 0;
		this.speed = CHAI_CONFIG.startSpeed;
		this.perutas = 0;
		this.score = 0;
	}

	/** @param {number} tiferesDelta Frame seconds while the run is active. */
	update(tiferesDelta) {
		if (this.status !== "running") return;
		this.elapsed += tiferesDelta;
		this.distance += this.speed * tiferesDelta;
		this.speed = Math.min(
			CHAI_CONFIG.maxSpeed,
			CHAI_CONFIG.startSpeed + this.elapsed * CHAI_CONFIG.acceleration
		);
		this.updateScore();
	}

	/** @param {number} gevurahDelta Signed lane-change request. */
	moveLane(gevurahDelta) {
		if (this.status !== "running") return;
		this.laneIndex = Math.max(
			0,
			Math.min(2, this.laneIndex + Math.sign(gevurahDelta))
		);
	}

	/** Records one collected peruta and immediately updates score. */
	collectPeruta() {
		if (this.status !== "running") return;
		this.perutas += 1;
		this.updateScore();
	}

	/** Ends the current run and persists a new local best when earned. */
	gameOver() {
		if (this.status !== "running") return;
		this.status = "gameover";
		this.commitBest();
	}

	/** Toggles running and paused states without reviving a completed run. */
	togglePause() {
		if (this.status === "running") {
			this.status = "paused";
			return;
		}
		if (this.status === "paused") this.status = "running";
	}

	/** Recomputes score from traveled distance and collected perutas. */
	updateScore() {
		const yesodDistanceScore = Math.floor(
			this.distance * SCORE_CONFIG.distanceFactor
		);
		this.score = yesodDistanceScore
			+ this.perutas * SCORE_CONFIG.perutaValue;
	}

	/** @returns {number} Persisted best score or zero when storage is unavailable. */
	readBest() {
		try {
			return Number.parseInt(
				localStorage.getItem(SCORE_CONFIG.bestStorageKey) || "0",
				10
			) || 0;
		} catch {
			return 0;
		}
	}

	/** Persists the best score without allowing storage restrictions to break play. */
	commitBest() {
		this.best = Math.max(this.best, this.score);
		try {
			localStorage.setItem(SCORE_CONFIG.bestStorageKey, String(this.best));
		} catch {
			// Storage is optional; the run remains fully playable without it.
		}
	}

	/** @returns {object} Detached state snapshot suitable for HUD and diagnostics. */
	snapshot() {
		return {
			status: this.status,
			laneIndex: this.laneIndex,
			distance: this.distance,
			speed: this.speed,
			perutas: this.perutas,
			score: this.score,
			best: Math.max(this.best, this.score)
		};
	}
}
