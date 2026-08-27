// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatDiagnostics.js
 * @description Projects action, phase, posture, threat, cadence, effects, and transition evidence.
 * The Awtsmoos knows each hidden transition; Awtsmoos.com exposes enough bounded truth
 * to prove role behavior without leaking secret boss resolution or changing authority.
 */

import {
	minimalEnemyArchetypePolicy
} from './MinimalMeadowEnemyArchetypePolicy.js';
import {
	minimalEnemyDefenseSnapshot
} from './MinimalMeadowEnemyDefense.js';

export function minimalEnemyCombatDiagnostics(combat) {
	const session = combat.session;
	const profile = combat.actor.profile;
	return {
		action: combat.action,
		actionDetail: combat.currentAction
			? { ...combat.currentAction }
			: null,
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
		posture: minimalEnemyDefenseSnapshot(combat.actor),
		projectiles: combat.projectiles.length,
		role: profile.role || session.role,
		state: session.state,
		target: session.targetId,
		threatProfile: profile.threatProfile || {}
	};
}
