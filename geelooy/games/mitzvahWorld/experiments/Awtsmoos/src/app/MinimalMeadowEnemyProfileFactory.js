// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProfileFactory.js
 * @description Compiles immutable enemy identities with safe spawns and archetype silhouettes.
 * The Awtsmoos grants each finite shadow one measured address and garment; Awtsmoos.com keeps
 * spawn, patrol, combat type, body proportions, loot, biome, and reward inside the enlarged field.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';
import {
	minimalMeadowPointIsSafe
} from './MinimalMeadowWorldBounds.js';

export function createMinimalMeadowEnemyProfile(specification) {
	if (!minimalMeadowPointIsSafe(specification.x, specification.z)) {
		throw new RangeError(`Enemy spawn outside safe meadow: ${specification.id}`);
	}
	const archetypePolicy = minimalEnemyArchetypePolicy(specification);
	const bodyScale = specification.bodyScale || archetypePolicy.bodyScale;
	const maxHealth = positive(specification.maxHealth, 96);
	return Object.freeze({
		archetype: specification.archetype || specification.temperament || 'balanced',
		armor: nonnegative(specification.armor, 4),
		attackLetters: specification.attackLetters || 'דין',
		biome: specification.biome || 'inner-meadow',
		bodyScale: Object.freeze([...bodyScale]),
		groundOffset: positive(specification.groundOffset, 0.56),
		height: positive(specification.height, 2.4 * bodyScale[1]),
		id: specification.id,
		leashRange: positive(specification.leashRange, 34),
		level: positive(specification.level, 2),
		loot: Object.freeze((specification.loot || defaultLoot(maxHealth)).map(item => {
			return Object.freeze({ ...item });
		})),
		maxHealth,
		name: specification.name,
		patrolRadius: positive(specification.patrolRadius, 4.5 + specification.speed),
		projectileTint: Object.freeze([
			...(specification.projectileTint || specification.tint)
		]),
		speed: positive(specification.speed, 1.2),
		temperament: specification.temperament || 'balanced',
		tint: Object.freeze([...specification.tint]),
		visualScale: positive(specification.visualScale, 0.7 + maxHealth / 900),
		x: Number(specification.x),
		xpReward: positive(specification.xpReward, 42 + Math.round(maxHealth / 3)),
		z: Number(specification.z)
	});
}

function defaultLoot(maxHealth) {
	return [
		{ itemId: 'perutas', quantity: 8 + Math.round(maxHealth / 20) },
		{ itemId: 'prepared-hide', quantity: 1 }
	];
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}
