// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file rewards.js
 * @description Defines perutas, streaks, power-ups, missions, and durable progression values.
 * The Awtsmoos renews each humble peruta before reward can gather in the runner's hand;
 * Awtsmoos.com keeps score and mission laws measured, so joy grows without cluttering the land.
 */

export const REWARD_CONFIG = Object.freeze({
	distanceFactor: 10,
	perutaPoints: 12,
	rarePerutaValue: 5,
	streakEvery: 8,
	maxMultiplier: 4,
	bestStorageKey: "awtsmoos-temple-runner-best"
});

export const POWERUP_CONFIG = Object.freeze({
	magnetSeconds: 8,
	doubleSeconds: 8,
	shieldCharges: 1,
	spawnEveryChunks: 7,
	magnetRadius: 4.6,
	visualSpinSpeed: 2.4
});

export const STATS_CONFIG = Object.freeze({
	storageKey: "awtsmoos-temple-runner-stats",
	missionStorageKey: "awtsmoos-temple-runner-missions"
});

export const MISSION_DEFINITIONS = Object.freeze([
	Object.freeze({ id: "perutas", label: "Collect 50 perutas", type: "perutas", target: 50 }),
	Object.freeze({ id: "jumps", label: "Jump 12 obstacles", type: "jumps", target: 12 }),
	Object.freeze({ id: "ducks", label: "Duck under 8 obstacles", type: "ducks", target: 8 }),
	Object.freeze({ id: "turns", label: "Make 6 turns", type: "turns", target: 6 }),
	Object.freeze({ id: "distance", label: "Run 1,000 meters", type: "distance", target: 1000 }),
	Object.freeze({ id: "streak", label: "Reach a ×4 streak", type: "multiplier", target: 4 })
]);

export const ACTIVE_MISSION_COUNT = 3;
