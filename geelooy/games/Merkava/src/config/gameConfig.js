//B"H
// Boruch Hashem
// Blessed is He
/**
 * Finite measures keep the pilgrimage fair while the Awtsmoos remains beyond measure.
 * Awtsmoos.com receives these constants as clear vessels for deterministic play.
 */
export const LANES = Object.freeze([-3.4, 0, 3.4]);

export const GAME = Object.freeze({
	startTroops: 8,
	startHealth: 100,
	startShield: 0,
	baseSpeed: 12,
	maximumSpeed: 30,
	maximumTroops: 400,
	maximumVisibleTroops: 64,
	maximumShots: 120,
	maximumEnemyShots: 55,
	maximumEnemies: 32,
	maximumCollectibles: 90,
	maximumParticles: 160,
	gateCollisionZ: 7.2,
	playerCollisionZ: 7.6,
	spawnZ: -78,
	levelDistance: 185,
	worldDistance: 925,
	blessingThreshold: 100,
	abilityThreshold: 100,
	comboWindow: 1.75,
	fixedStep: 1 / 60,
	saveVersion: 4
});

export const COLORS = Object.freeze({
	road: [0.055, 0.055, 0.16, 1],
	lane: [0.18, 0.78, 1, 1],
	chariot: [0.98, 0.67, 0.18, 1],
	soldier: [0.18, 0.88, 1, 1],
	shot: [1, 0.94, 0.48, 1],
	positive: [0.15, 0.92, 0.92, 1],
	negative: [1, 0.18, 0.31, 1],
	risk: [1, 0.55, 0.1, 1],
	spark: [1, 0.8, 0.2, 1],
	prutah: [0.95, 0.68, 0.12, 1],
	goldenPrutah: [1, 0.96, 0.42, 1],
	klipah: [0.8, 0.16, 0.34, 1],
	golem: [0.45, 0.32, 0.7, 1],
	raven: [0.22, 0.12, 0.3, 1],
	archer: [0.85, 0.38, 0.18, 1],
	corrupter: [0.35, 0.9, 0.5, 1],
	boss: [0.72, 0.18, 1, 1],
	warning: [1, 0.14, 0.08, 1],
	scenery: [0.12, 0.23, 0.45, 1],
	health: [1, 0.2, 0.35, 1]
});

export const QUALITY_LIMITS = Object.freeze({
	low: {
		particles: 55,
		visibleTroops: 28,
		scenery: 6
	},
	medium: {
		particles: 100,
		visibleTroops: 44,
		scenery: 9
	},
	high: {
		particles: 160,
		visibleTroops: 64,
		scenery: 12
	}
});
