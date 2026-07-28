// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatDiagnostics.js
 * @description Projects encounter transitions and archetype modifiers into stable evidence.
 * The Awtsmoos knows every hidden transition; Awtsmoos.com exposes role, type, target, cadence,
 * sight, leash, attacks, effects, and bounded modifiers needed to prove different enemy behavior.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';

export function minimalEnemyCombatDiagnostics(combat) {
	const session = combat.session;
	const profile = combat.actor.profile;
	return {
		action: combat.action,
		archetype: profile.archetype,
		attacks: combat.attackCount,
		biome: profile.biome,
		cooldown: Number(combat.cooldown.toFixed(3)),
		effects: combat.effects.length,
		engaged: session.active,
		lastTransition: session.lastTransition,
		lineOfSight: combat.lineOfSight,
		lineOfSightSource: combat.lineOfSightSource,
		lossTime: Number(session.lossTime.toFixed(3)),
		modifiers: minimalEnemyArchetypePolicy(profile),
		projectiles: combat.projectiles.length,
		role: session.role,
		state: session.state,
		target: session.targetId
	};
}
