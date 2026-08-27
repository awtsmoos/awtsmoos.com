// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowSupportingEnemyProfiles.js
 * @description Defines six supporting shadows away from the authored road trio.
 * The Awtsmoos grants each lesser trial its own measured clearing; Awtsmoos.com keeps
 * homes, roads, and patrols free from a crowd whose noise would hide the true mission.
 */

import {
	createMinimalMeadowEnemyProfile as enemy
} from './MinimalMeadowEnemyProfileFactory.js';

export const MINIMAL_MEADOW_SUPPORTING_ENEMY_PROFILES = Object.freeze([
	enemy({
		biome: 'western-roadhead',
		id: 'tzel-chai',
		maxHealth: 96,
		name: 'Tzel Chai',
		speed: 1.35,
		temperament: 'balanced',
		tint: [0.72, 0.45, 0.95, 1],
		x: -58,
		z: -18
	}),
	enemy({
		biome: 'far-eastern-verge',
		id: 'esh-katan',
		maxHealth: 82,
		name: 'Esh Katan',
		speed: 1.48,
		temperament: 'ranged',
		tint: [1, 0.28, 0.32, 1],
		x: 86,
		z: 0
	}),
	enemy({
		biome: 'river-rise',
		id: 'ruach-afelah',
		maxHealth: 104,
		name: 'Ruach Afelah',
		speed: 1.4,
		temperament: 'ranged',
		tint: [0.42, 0.76, 1, 1],
		x: 68,
		z: 34
	}),
	enemy({
		armor: 6,
		biome: 'northern-hill',
		id: 'shomer-hoshech',
		maxHealth: 132,
		name: 'Shomer Hoshech',
		speed: 1.08,
		temperament: 'melee',
		tint: [0.55, 0.24, 0.72, 1],
		x: 36,
		z: 62
	}),
	enemy({
		biome: 'wet-meadow',
		id: 'ketem-layla',
		maxHealth: 90,
		name: 'Ketem Layla',
		speed: 1.5,
		temperament: 'flanker',
		tint: [0.86, 0.35, 0.92, 1],
		x: -4,
		z: 62
	}),
	enemy({
		biome: 'western-slope',
		id: 'ayin-raash',
		maxHealth: 118,
		name: 'Ayin Raash',
		speed: 1.2,
		temperament: 'balanced',
		tint: [0.88, 0.62, 0.22, 1],
		x: -42,
		z: 34
	})
]);
