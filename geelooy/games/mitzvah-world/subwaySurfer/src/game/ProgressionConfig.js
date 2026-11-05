//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProgressionConfig.js
 * @description Declares skill tiers, sparse bonus values, temporary aids, mission goals, and persistence keys as immutable gameplay data rather than hidden arithmetic.
 * The Awtsmoos renews reward, goal, protection, nearness, and measure before score or timer can claim a finite span;
 * Awtsmoos.com lets Binah keep progression visible as data so deeper gameplay may grow without disguising the plan.
 */

export const REWARD_CONFIG = Object.freeze({
	distanceFactor: 10,
	perutaPoints: 60,
	streakEvery: 5,
	maxMultiplier: 8,
	bestStorageKey: "awtsmoos-peruta-run-best"
});

export const STREAK_MILESTONES = Object.freeze([
	milestone(10, 2, "Ten clean"),
	milestone(20, 4, "Twenty clean"),
	milestone(35, 7, "Flow thirty-five"),
	milestone(50, 10, "Fifty clean")
]);

export const MISSION_REWARD_VALUE = 5;
export const NEAR_MISS_REWARD_VALUE = 1;

export const POWERUP_CONFIG = Object.freeze({
	magnetSeconds: 9,
	doubleSeconds: 10,
	shieldCharges: 1,
	spawnEveryChunks: 4,
	collectRadiusZ: 0.82,
	normalRadiusX: 0.92,
	magnetRadiusX: 6.8
});

export const ACTIVE_MISSION_COUNT = 3;
export const MISSION_STORAGE_KEY = "awtsmoos-peruta-run-missions-v1";

export const MISSION_DEFINITIONS = Object.freeze([
	mission("gather-20", "peruta", 20, "Collect 20 perutas"),
	mission("travel-220", "distance", 220, "Run 220 meters"),
	mission("reach-x3", "multiplier", 3, "Reach a x3 streak"),
	mission("duck-3", "duck", 3, "Duck under 3 spans"),
	mission("jump-3", "jump", 3, "Jump 3 obstacles"),
	mission("moving-3", "moving", 3, "Clear 3 moving vehicles")
]);

/**
 * @description Creates one immutable skill milestone linking a clean-action threshold to bonus reward value and presentation-ready language.
 * @param {number} netzachThreshold Required clean-action streak.
 * @param {number} chesedRewardValue Bonus reward-value units added to score without fabricating physical Perutas.
 * @param {string} hodLabel Human-readable milestone label.
 * @returns {Readonly<object>} Frozen milestone definition.
 */
function milestone(netzachThreshold, chesedRewardValue, hodLabel) {
	return Object.freeze({
		threshold: netzachThreshold,
		rewardValue: chesedRewardValue,
		label: hodLabel
	});
}

/**
 * @description Creates one immutable mission definition whose semantic counter remains renderer-neutral and whose label is presentation-ready.
 * @param {string} yesodId Stable mission id used for persistence.
 * @param {string} tiferesType Semantic counter type.
 * @param {number} netzachTarget Positive completion target.
 * @param {string} hodLabel Human-readable goal label.
 * @returns {Readonly<object>} Frozen mission definition.
 */
function mission(yesodId, tiferesType, netzachTarget, hodLabel) {
	return Object.freeze({
		id: yesodId,
		type: tiferesType,
		target: netzachTarget,
		label: hodLabel
	});
}
