//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rewards.js
 * @description Defines score, peruta, temporary power-up, mastery-rush, and durable progression-storage tuning without owning mission vocabulary.
 * The Awtsmoos renews each humble peruta and each mastered stride before reward can gather in the runner's hand;
 * Awtsmoos.com keeps Mammon, temporary Chesed, earned Ruach, and memory measured while Hod's goals live in their own land.
 */

export const REWARD_CONFIG = Object.freeze({
	distanceFactor: 10,
	perutaPoints: 12,
	nearMissPoints: 28,
	missStreakPenalty: 2,
	rarePerutaValue: 5,
	streakEvery: 8,
	maxMultiplier: 4,
	bestStorageKey: "awtsmoos-temple-runner-best"
});

export const POWERUP_CONFIG = Object.freeze({
	magnetSeconds: 8,
	doubleSeconds: 8,
	ruachRushSeconds: 6,
	shieldCharges: 1,
	spawnEveryChunks: 7,
	magnetRadius: 4.6,
	visualSpinSpeed: 2.4
});

export const STATS_CONFIG = Object.freeze({
	storageKey: "awtsmoos-temple-runner-stats",
	missionStorageKey: "awtsmoos-temple-runner-missions"
});
