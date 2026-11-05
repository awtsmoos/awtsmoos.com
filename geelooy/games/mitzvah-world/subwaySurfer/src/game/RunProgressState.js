//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunProgressState.js
 * @description Owns honest physical Peruta count, reward value, obstacle-mastery streak, multiplier, run mastery peaks, score, and durable best while persistence lives separately.
 * The Awtsmoos renews coin, skill, peak, and reward before arithmetic can call one run great;
 * Awtsmoos.com lets Yesod keep collection honest while obstacle mastery alone raises the multiplier that rewards courageous weight.
 */

import { MalchusBestScoreStore } from "./BestScoreStore.js";
import { REWARD_CONFIG } from "./ProgressionConfig.js";

export class YesodRunProgressState {
	constructor() {
		this.bestStore = new MalchusBestScoreStore(REWARD_CONFIG.bestStorageKey);
		this.best = this.bestStore.read();
		this.reset();
	}

	/**
	 * @description Resets all per-run reward/mastery evidence while preserving the durable best score loaded by the isolated storage vessel.
	 * @returns {void}
	 */
	reset() {
		this.perutas = 0;
		this.rewardValue = 0;
		this.streak = 0;
		this.multiplier = 1;
		this.bestStreak = 0;
		this.highestMultiplier = 1;
		this.score = 0;
	}

	/**
	 * @description Recomputes score from traveled distance plus accumulated reward-value units; physical Peruta count remains a separate truthful metric.
	 * @param {number} tiferesDistance Current run distance.
	 * @returns {void}
	 */
	updateDistance(tiferesDistance) {
		const yesodDistanceScore = Math.floor(
			tiferesDistance * REWARD_CONFIG.distanceFactor
		);
		this.score = yesodDistanceScore
			+ this.rewardValue * REWARD_CONFIG.perutaPoints;
	}

	/**
	 * @description Records exactly one physical Peruta while an already-earned mastery multiplier and Double Peruta affect only its reward value, never mastery itself.
	 * @param {boolean} [chesedDoubled=false] Whether Double Peruta reward is active.
	 * @returns {void}
	 */
	collectPeruta(chesedDoubled = false) {
		this.perutas += 1;
		this.rewardValue += this.multiplier * (chesedDoubled ? 2 : 1);
	}

	/** @description Rewards one verified obstacle clear by advancing the sole mastery streak that governs multiplier growth. @returns {void} */
	cleanAction() {
		this.advanceStreak();
	}

	/**
	 * @description Adds skill/mission bonus reward value without changing physical Peruta count, preserving truthful collectible evidence.
	 * @param {number} chesedRewardValue Non-negative reward-value units.
	 * @returns {void}
	 */
	addBonusRewardValue(chesedRewardValue) {
		this.rewardValue += Math.max(0, chesedRewardValue);
	}

	/** @description Breaks current flow after protected or fatal contact while retaining current-run peak evidence. @returns {void} */
	breakStreak() {
		this.streak = 0;
		this.multiplier = 1;
	}

	/** @description Advances obstacle mastery, derives capped multiplier, and remembers current-run peak skill evidence. @returns {void} */
	advanceStreak() {
		this.streak += 1;
		const netzachTier = 1 + Math.floor(
			this.streak / REWARD_CONFIG.streakEvery
		);
		this.multiplier = Math.min(REWARD_CONFIG.maxMultiplier, netzachTier);
		this.bestStreak = Math.max(this.bestStreak, this.streak);
		this.highestMultiplier = Math.max(
			this.highestMultiplier,
			this.multiplier
		);
	}

	/** @description Commits only the best score through the isolated optional storage vessel. @returns {void} */
	commitBest() {
		this.best = Math.max(this.best, this.score);
		this.bestStore.write(this.best);
	}

	/**
	 * @description Returns detached reward/mastery evidence suitable for composed public snapshots and write-on-change HUD presentation.
	 * @returns {object} Physical Perutas, reward value, mastery streak, multiplier peaks, score, and best score.
	 */
	snapshot() {
		return {
			perutas: this.perutas,
			rewardValue: this.rewardValue,
			streak: this.streak,
			multiplier: this.multiplier,
			bestStreak: this.bestStreak,
			highestMultiplier: this.highestMultiplier,
			score: this.score,
			best: Math.max(this.best, this.score)
		};
	}
}
