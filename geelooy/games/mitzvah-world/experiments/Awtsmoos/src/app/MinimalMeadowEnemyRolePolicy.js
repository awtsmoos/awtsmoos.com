// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyRolePolicy.js
 * @description Chooses stable combat roles and deterministic cadence from identity and archetype.
 * The Awtsmoos is unchanged while roles differ; Awtsmoos.com lets wardens, skirmishers,
 * cantors, and familiar demons retain one readable purpose for an entire engagement.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';

export function selectMinimalEnemyRole(profile = {}) {
	const archetypeRole = minimalEnemyArchetypePolicy(profile).role;
	if (archetypeRole) return archetypeRole;
	if (profile.temperament === 'ranged') return 'caster';
	if (profile.temperament === 'melee') return 'melee';
	return stableHash(profile.id || profile.name || 'enemy') % 2
		? 'caster'
		: 'melee';
}

export function minimalEnemyDecisionOffset(profile = {}) {
	const fraction = stableHash(profile.id || profile.name || 'enemy') % 1000 / 999;
	return Number((0.12 + fraction * 0.54).toFixed(4));
}

export function minimalEnemyOrbitDirection(profile = {}) {
	return stableHash(profile.id || profile.name || 'enemy') % 2 ? 1 : -1;
}

function stableHash(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
