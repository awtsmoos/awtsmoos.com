// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowKedemWardenProfile.js
 * @description Defines the three-phase Kedem Warden with guard, zones, concealment, and scaling metadata.
 * The Awtsmoos lets one enemy change its revealed vessel without changing its lawful identity;
 * Awtsmoos.com keeps phase grammar, posture, reconnect fields, loot, threat, and budgets explicit.
 */

import {
	createMinimalMeadowEnemyProfile as enemy
} from './MinimalMeadowEnemyProfileFactory.js';

export const MINIMAL_MEADOW_KEDEM_WARDEN_PROFILE = enemy({
	actionDeck: [
		'measured-guard',
		'dividing-seal',
		'concealed-unification'
	],
	antiStunlockMilliseconds: 3200,
	archetype: 'warden',
	armor: 12,
	attackLetters: 'קדם',
	biome: 'kedem-highlands',
	boss: true,
	counterOpportunity: 'clarify-break-posture-release',
	guardStrength: 0.62,
	id: 'kedem-letter-warden',
	level: 6,
	leashRange: 42,
	lootIdentity: 'kedem-measured-intent',
	maxHealth: 520,
	movementProfile: {
		divisionZones: 2,
		holdsGround: true,
		soloScale: 1
	},
	name: 'Kedem Letter Warden',
	networkFields: {
		defeatedClaimId: 'vertical-slice:kedem-warden:first-clear',
		phaseAuthority: 'server',
		reconnectRestoresPhase: true
	},
	patrolRadius: 4,
	performanceBudget: {
		effects: 32,
		updatesPerSecond: 30
	},
	phaseSet: [
		{ id: 'measure', threshold: 1 },
		{ id: 'division', threshold: 0.67 },
		{ id: 'concealment-unification', threshold: 0.34 }
	],
	postureMaximum: 260,
	projectileTint: [0.72, 0.28, 0.88, 1],
	role: 'Mini-boss',
	speed: 1.02,
	telegraphVocabulary: {
		concealment: 'broken glyph and phase label',
		division: 'two striped arena fields',
		measure: 'square guard and measured ring'
	},
	temperament: 'melee',
	threatProfile: {
		control: 1.2,
		objective: 1.5,
		proximity: 1.15
	},
	tint: [0.5, 0.2, 0.55, 1],
	visualScale: 1.24,
	weakness: 'learned-clarify-posture-sequence',
	x: -80,
	xpReward: 260,
	z: 75
});
