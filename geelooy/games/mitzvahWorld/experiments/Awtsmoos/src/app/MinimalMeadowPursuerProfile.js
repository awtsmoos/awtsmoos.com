// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPursuerProfile.js
 * @description Defines the mobile Pursuer who punishes straight retreat and can overshoot.
 * The Awtsmoos gives speed direction, commitment, and recovery; Awtsmoos.com
 * makes sidestep, redirection, terrain contact, dead zones, and readable motion explicit.
 */

import {
	createMinimalMeadowEnemyProfile as enemy
} from './MinimalMeadowEnemyProfileFactory.js';
import {
	minimalMeadowRoadEncounterStation
} from './MinimalMeadowRoadEncounterStations.js';

const station = minimalMeadowRoadEncounterStation('skirmisher');

export const MINIMAL_MEADOW_PURSUER_PROFILE = enemy({
	antiStunlockMilliseconds: 1800,
	archetype: 'skirmisher',
	armor: 2,
	biome: 'eastern-road',
	counterOpportunity: 'sidestep-during-committed-rush',
	guardStrength: 0.08,
	id: 'ratz-layla',
	level: 3,
	lootIdentity: 'pursuer-step-thread',
	maxHealth: 72,
	movementProfile: {
		overshootDistance: 3.5,
		tracksStraightRetreat: true
	},
	name: 'Ratz Layla · Pursuer',
	patrolRadius: 7,
	performanceBudget: {
		effects: 10,
		updatesPerSecond: 30
	},
	postureMaximum: 58,
	role: 'Pursuer',
	speed: 1.65,
	telegraphVocabulary: {
		rush: 'arrow wedge',
		turn: 'double footprint'
	},
	temperament: 'flanker',
	threatProfile: {
		proximity: 0.8,
		vulnerableTarget: 1.35
	},
	tint: [0.18, 0.9, 0.75, 1],
	visualScale: 0.68,
	weakness: 'directional-sidestep-terrain-redirection',
	x: station.x,
	xpReward: 68,
	z: station.z
});
