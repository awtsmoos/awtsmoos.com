// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowScribeProfile.js
 * @description Defines the delayed-cast Scribe whose glyph phases teach counter timing and Daas.
 * The Awtsmoos gives letters duration, warning, recovery, and lawful interruption;
 * Awtsmoos.com makes seal shape, cast category, resistance, vulnerability, and learned guidance clear.
 */

import {
	createMinimalMeadowEnemyProfile as enemy
} from './MinimalMeadowEnemyProfileFactory.js';
import {
	minimalMeadowRoadEncounterStation
} from './MinimalMeadowRoadEncounterStations.js';

const station = minimalMeadowRoadEncounterStation('cantor');

export const MINIMAL_MEADOW_SCRIBE_PROFILE = enemy({
	actionDeck: ['letter-bolt', 'binding-verse', 'grounding-chant'],
	antiStunlockMilliseconds: 2100,
	archetype: 'cantor',
	armor: 3,
	attackLetters: 'אות',
	biome: 'eastern-road',
	counterOpportunity: 'late-windup-or-recovery',
	guardStrength: 0.16,
	id: 'baal-otiyot',
	level: 3,
	lootIdentity: 'scribe-glyph-fragment',
	maxHealth: 110,
	movementProfile: {
		holdsCastingDistance: true,
		recoveryPauseMilliseconds: 900
	},
	name: 'Baal Otiyot · Scribe',
	patrolRadius: 5,
	performanceBudget: {
		effects: 16,
		updatesPerSecond: 24
	},
	postureMaximum: 76,
	projectileTint: [1, 0.82, 0.24, 1],
	role: 'Scribe',
	speed: 1.05,
	telegraphVocabulary: {
		cast: 'stacked glyph border',
		recovery: 'open broken circle',
		seal: 'square rune field'
	},
	temperament: 'ranged',
	threatProfile: {
		control: 1.25,
		interruption: 1.1
	},
	tint: [1, 0.62, 0.18, 1],
	visualScale: 0.82,
	weakness: 'counter-timing-recovery-pressure',
	x: station.x,
	xpReward: 78,
	z: station.z
});
