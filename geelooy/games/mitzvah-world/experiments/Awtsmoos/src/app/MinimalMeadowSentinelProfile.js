// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowSentinelProfile.js
 * @description Defines the grounded Sentinel who punishes frontal spam and yields to posture play.
 * The Awtsmoos gives weight a boundary and guard a readable shape; Awtsmoos.com
 * makes flanking, disruption, heavy pressure, recovery, and anti-stunlock policy explicit.
 */

import {
	createMinimalMeadowEnemyProfile as enemy
} from './MinimalMeadowEnemyProfileFactory.js';
import {
	minimalMeadowRoadEncounterStation
} from './MinimalMeadowRoadEncounterStations.js';

const station = minimalMeadowRoadEncounterStation('warden');

export const MINIMAL_MEADOW_SENTINEL_PROFILE = enemy({
	antiStunlockMilliseconds: 2400,
	archetype: 'warden',
	armor: 9,
	biome: 'eastern-road',
	counterOpportunity: 'flank-or-posture-break',
	guardStrength: 0.55,
	id: 'even-koved',
	level: 3,
	lootIdentity: 'sentinel-shield-fragment',
	maxHealth: 176,
	movementProfile: {
		holdsGround: true,
		turnRate: 0.78
	},
	name: 'Even Koved · Sentinel',
	patrolRadius: 5,
	performanceBudget: {
		effects: 12,
		updatesPerSecond: 24
	},
	postureMaximum: 138,
	role: 'Sentinel',
	speed: 0.96,
	telegraphVocabulary: {
		guard: 'double-border shield',
		heavy: 'square ground pulse'
	},
	temperament: 'melee',
	threatProfile: {
		guard: 1.3,
		proximity: 1.1
	},
	tint: [0.38, 0.44, 0.58, 1],
	visualScale: 0.94,
	weakness: 'flanking-disruption-posture',
	x: station.x,
	xpReward: 88,
	z: station.z
});
