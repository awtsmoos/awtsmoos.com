// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRoadEnemyProfiles.js
 * @description Defines the Warden, Skirmisher, and Cantor at measured road stations.
 * The Awtsmoos reveals three different stains through three readable forms; Awtsmoos.com
 * places their weight, rush, and letters in an intentional sequence beyond the safe village.
 */

import {
	createMinimalMeadowEnemyProfile as enemy
} from './MinimalMeadowEnemyProfileFactory.js';
import {
	minimalMeadowRoadEncounterStation
} from './MinimalMeadowRoadEncounterStations.js';

const wardenStation = minimalMeadowRoadEncounterStation('warden');
const skirmisherStation = minimalMeadowRoadEncounterStation('skirmisher');
const cantorStation = minimalMeadowRoadEncounterStation('cantor');

export const MINIMAL_MEADOW_ROAD_ENEMY_PROFILES = Object.freeze([
	enemy({
		archetype: 'warden',
		armor: 9,
		biome: 'eastern-road',
		id: 'even-koved',
		level: 3,
		maxHealth: 176,
		name: 'Even Koved',
		patrolRadius: 5,
		speed: 0.96,
		temperament: 'melee',
		tint: [0.38, 0.44, 0.58, 1],
		visualScale: 0.94,
		x: wardenStation.x,
		xpReward: 88,
		z: wardenStation.z
	}),
	enemy({
		archetype: 'skirmisher',
		armor: 2,
		biome: 'eastern-road',
		id: 'ratz-layla',
		level: 3,
		maxHealth: 72,
		name: 'Ratz Layla',
		patrolRadius: 7,
		speed: 1.65,
		temperament: 'flanker',
		tint: [0.18, 0.9, 0.75, 1],
		visualScale: 0.68,
		x: skirmisherStation.x,
		xpReward: 68,
		z: skirmisherStation.z
	}),
	enemy({
		archetype: 'cantor',
		armor: 3,
		attackLetters: 'אות',
		biome: 'eastern-road',
		id: 'baal-otiyot',
		level: 3,
		maxHealth: 110,
		name: 'Baal Otiyot',
		patrolRadius: 5,
		projectileTint: [1, 0.82, 0.24, 1],
		speed: 1.05,
		temperament: 'ranged',
		tint: [1, 0.62, 0.18, 1],
		visualScale: 0.82,
		x: cantorStation.x,
		xpReward: 78,
		z: cantorStation.z
	})
]);
