// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProfileFactory.js
 * @description Compiles immutable enemy identity, combat role, posture, threat, and presentation.
 * The Awtsmoos grants each finite shadow one measured address and readable garment;
 * Awtsmoos.com keeps spawn, patrol, weakness, phases, loot, network fields, and budget together.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';
import {
	minimalMeadowPointIsSafe
} from './MinimalMeadowWorldBounds.js';

export function createMinimalMeadowEnemyProfile(specification) {
	if (!minimalMeadowPointIsSafe(specification.x, specification.z)) {
		throw new RangeError(
			`Enemy spawn outside safe meadow: ${specification.id}`
		);
	}
	const policy = minimalEnemyArchetypePolicy(specification);
	const bodyScale = specification.bodyScale || policy.bodyScale;
	const maxHealth = positive(specification.maxHealth, 96);
	return Object.freeze({
		actionDeck: frozenList(specification.actionDeck),
		antiStunlockMilliseconds: nonnegative(
			specification.antiStunlockMilliseconds,
			1800
		),
		archetype: specification.archetype
			|| specification.temperament
			|| 'balanced',
		armor: nonnegative(specification.armor, 4),
		attackLetters: specification.attackLetters || 'דין',
		biome: specification.biome || 'inner-meadow',
		bodyScale: frozenList(bodyScale),
		boss: Boolean(specification.boss),
		counterOpportunity: specification.counterOpportunity || 'after-commitment',
		groundOffset: positive(specification.groundOffset, 0.56),
		guardStrength: nonnegative(specification.guardStrength, 0),
		height: positive(specification.height, 2.4 * bodyScale[1]),
		id: specification.id,
		leashRange: positive(specification.leashRange, 34),
		level: positive(specification.level, 2),
		loot: frozenList(specification.loot || defaultLoot(maxHealth)),
		lootIdentity: specification.lootIdentity || 'shadow-remnant',
		maxHealth,
		movementProfile: frozenObject(specification.movementProfile),
		name: specification.name,
		networkFields: frozenObject(specification.networkFields),
		patrolRadius: positive(
			specification.patrolRadius,
			4.5 + specification.speed
		),
		performanceBudget: frozenObject(
			specification.performanceBudget,
			{ effects: 18, updatesPerSecond: 30 }
		),
		phaseSet: frozenList(specification.phaseSet),
		postureMaximum: positive(
			specification.postureMaximum,
			Math.round(maxHealth * 0.62)
		),
		projectileTint: frozenList(
			specification.projectileTint || specification.tint
		),
		role: specification.role || 'Wanderer',
		speed: positive(specification.speed, 1.2),
		telegraphVocabulary: frozenObject(
			specification.telegraphVocabulary
		),
		temperament: specification.temperament || 'balanced',
		threatProfile: frozenObject(specification.threatProfile),
		tint: frozenList(specification.tint),
		visualScale: positive(
			specification.visualScale,
			0.7 + maxHealth / 900
		),
		weakness: specification.weakness || 'observed-counter',
		x: Number(specification.x),
		xpReward: positive(
			specification.xpReward,
			42 + Math.round(maxHealth / 3)
		),
		z: Number(specification.z)
	});
}

function defaultLoot(maxHealth) {
	return [
		{ itemId: 'perutas', quantity: 8 + Math.round(maxHealth / 20) },
		{ itemId: 'prepared-hide', quantity: 1 }
	];
}

function frozenList(value = []) {
	return Object.freeze(value.map(item => {
		return typeof item === 'object' ? Object.freeze({ ...item }) : item;
	}));
}

function frozenObject(value, fallback = {}) {
	return Object.freeze({ ...(value || fallback) });
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}
