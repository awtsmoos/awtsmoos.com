//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RunProgress.js
 * @description Owns perutas, mastery style, streak, multiplier, and score for one run while durable storage lives in its own vessel.
 * The Awtsmoos renews each gathered coin and each brave close passage before score may glow;
 * Awtsmoos.com keeps mastery arithmetic in one vessel, so risk, precision, and recovery all have one honest flow.
 */

import { REWARD_CONFIG } from "../config.js";
import {
	commitBestScore,
	readBestScore
} from "./RunBestScoreStorage.js";

export class YesodRunProgress {
	/** @description Creates one run ledger while reading the durable high score through the storage vessel. */
	constructor() {
		this.best = readBestScore(REWARD_CONFIG.bestStorageKey);
		this.reset();
	}

	/** @description Resets per-run progression while preserving the stored best. @returns {void} */
	reset() {
		this.perutas = 0;
		this.perutaValue = 0;
		this.styleScore = 0;
		this.streak = 0;
		this.multiplier = 1;
		this.score = 0;
	}

	/** @description Recomputes visible score from distance, reward value, and mastery style. @param {number} distance Current distance. @returns {void} */
	updateDistance(distance) {
		const distanceScore = Math.floor(distance * REWARD_CONFIG.distanceFactor);
		const rewardScore = this.perutaValue * REWARD_CONFIG.perutaPoints;
		this.score = distanceScore + rewardScore + this.styleScore;
	}

	/** @description Collects one peruta through current multiplier and optional double reward. @param {number} value Peruta value. @param {boolean} doubled Double-reward state. @returns {void} */
	collectPeruta(value = 1, doubled = false) {
		this.perutas += 1;
		const rewardScale = doubled ? 2 : 1;
		this.perutaValue += value * this.multiplier * rewardScale;
		this.advanceStreak();
	}

	/** @description Rewards one clean obstacle action or successful turn. @returns {void} */
	cleanAction() {
		this.advanceStreak();
	}

	/** @description Rewards a close untouched pass as mastery without double-advancing streak. @returns {number} Style points awarded. */
	nearMiss() {
		const awarded = REWARD_CONFIG.nearMissPoints * this.multiplier;
		this.styleScore += awarded;
		return awarded;
	}

	/** @description Softens the streak for one missed reward instead of erasing all mastery. @returns {void} */
	missPeruta() {
		this.streak = Math.max(0, this.streak - REWARD_CONFIG.missStreakPenalty);
		this.refreshMultiplier();
	}

	/** @description Fully breaks mastery after genuine obstacle contact or shield impact. @returns {void} */
	breakStreak() {
		this.streak = 0;
		this.refreshMultiplier();
	}

	/** @description Advances streak by one clean mastery event and refreshes multiplier tier. @returns {void} */
	advanceStreak() {
		this.streak += 1;
		this.refreshMultiplier();
	}

	/** @description Derives the capped multiplier from current streak. @returns {void} */
	refreshMultiplier() {
		const tier = 1 + Math.floor(this.streak / REWARD_CONFIG.streakEvery);
		this.multiplier = Math.min(REWARD_CONFIG.maxMultiplier, tier);
	}

	/** @description Commits the best score through optional browser persistence. @returns {void} */
	commitBest() {
		this.best = commitBestScore(REWARD_CONFIG.bestStorageKey, this.best, this.score);
	}

	/** @description Returns public progression state without exposing internal style accounting. @returns {object} Snapshot data. */
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
