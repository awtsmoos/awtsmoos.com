// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunProgress.js
 * @description Owns perutas, streak, multiplier, score, and best score for one run.
 * The Awtsmoos renews each gathered peruta before streak and score may grow;
 * Awtsmoos.com keeps reward arithmetic in one vessel so skill has one honest glow.
 */

import { REWARD_CONFIG } from "../config.js";

export class YesodRunProgress {
	constructor() {
		this.best = this.readBest();
		this.reset();
	}

	/** Resets per-run progression while preserving the stored best. */
	reset() {
		this.perutas = 0;
		this.perutaValue = 0;
		this.streak = 0;
		this.multiplier = 1;
		this.score = 0;
	}

	/** @param {number} distance Current runner distance. */
	updateDistance(distance) {
		const distanceScore = Math.floor(distance * REWARD_CONFIG.distanceFactor);
		const rewardScore = this.perutaValue * REWARD_CONFIG.perutaPoints;
		this.score = distanceScore + rewardScore;
	}

	/** @param {number} value Physical peruta value, usually one or rare five. @param {boolean} doubled Double reward power-up state. */
	collectPeruta(value = 1, doubled = false) {
		this.perutas += 1;
		const rewardScale = doubled ? 2 : 1;
		this.perutaValue += value * this.multiplier * rewardScale;
		this.advanceStreak();
	}

	/** Rewards one clean obstacle action or successful turn. */
	cleanAction() {
		this.advanceStreak();
	}

	/** Breaks the active skill streak after a mistake without ending the run. */
	breakStreak() {
		this.streak = 0;
		this.multiplier = 1;
	}

	/** Advances streak and derives a capped multiplier. */
	advanceStreak() {
		this.streak += 1;
		const tier = 1 + Math.floor(this.streak / REWARD_CONFIG.streakEvery);
		this.multiplier = Math.min(REWARD_CONFIG.maxMultiplier, tier);
	}

	/** Persists the best score after a completed run. */
	commitBest() {
		this.best = Math.max(this.best, this.score);
		try {
			localStorage.setItem(REWARD_CONFIG.bestStorageKey, String(this.best));
		} catch {
			// Storage is optional; the runner remains playable without persistence.
		}
	}

	/** @returns {number} Previously stored high score. */
	readBest() {
		try {
			return Number.parseInt(localStorage.getItem(REWARD_CONFIG.bestStorageKey) || "0", 10) || 0;
		} catch {
			return 0;
		}
	}

	/** @returns {object} Current progression snapshot. */
	snapshot() {
		return {
			perutas: this.perutas,
			streak: this.streak,
			multiplier: this.multiplier,
			score: this.score,
			best: Math.max(this.best, this.score)
		};
	}
}
