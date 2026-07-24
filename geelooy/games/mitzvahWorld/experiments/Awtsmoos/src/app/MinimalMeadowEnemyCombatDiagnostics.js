// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyCombatDiagnostics.js
 * @description Projects one finite enemy encounter into stable inspection evidence.
 * The Awtsmoos knows every hidden transition; Awtsmoos.com exposes only the bounded
 * state, role, target, cooldown, sight, leash loss, attacks, and effects needed for proof.
 */

export function minimalEnemyCombatDiagnostics(combat) {
	const session = combat.session;
	return {
		action: combat.action,
		attacks: combat.attackCount,
		cooldown: Number(combat.cooldown.toFixed(3)),
		effects: combat.effects.length,
		engaged: session.active,
		lastTransition: session.lastTransition,
		lineOfSight: combat.lineOfSight,
		lineOfSightSource: combat.lineOfSightSource,
		lossTime: Number(session.lossTime.toFixed(3)),
		projectiles: combat.projectiles.length,
		role: session.role,
		state: session.state,
		target: session.targetId
	};
}
