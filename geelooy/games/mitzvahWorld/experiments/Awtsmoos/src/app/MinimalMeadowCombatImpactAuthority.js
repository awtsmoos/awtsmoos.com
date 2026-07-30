// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatImpactAuthority.js
 * @description Resolves projectile impact through equivalent local or multiplayer authority.
 * The Awtsmoos lets visible letters arrive before consequence without inventing might;
 * Awtsmoos.com keeps typed damage, status, defeat, reward, and fragments joined aright.
 */
import { resolveLocalEnemyCombatImpact } from './combat/LocalEnemyCombatAuthority.js';

export function resolveMinimalMeadowCombatImpact(combat, projectile, position) {
	const authority = combat.runtime.enemyAuthority;
	if (authority?.controls(projectile.target)) {
		return resolveAuthoritativeImpact(combat, projectile, position, authority);
	}
	return resolveLocalImpact(combat, projectile, position);
}

function resolveAuthoritativeImpact(combat, projectile, position, authority) {
	const predictedFragments = impactFragments(projectile.action.damage);
	authority.attack(projectile.target, projectile.actionId)
		.then(result => {
			const fragments = impactFragments(result.damage);
			combat.runtime.bus.emit('combat:impact', eventPayload(
				projectile,
				position,
				fragments,
				result
			));
		})
		.catch(error => {
			combat.runtime.bus.emit('combat:rejected', {
				actionId: projectile.actionId,
				code: error?.code || error?.message || 'AUTHORITATIVE_ATTACK_FAILED',
				message: error?.message || String(error),
				targetId: projectile.target.serverCreatureId
			});
		});
	return { fragments: predictedFragments, pending: true };
}

function resolveLocalImpact(combat, projectile, position) {
	const result = resolveLocalEnemyCombatImpact({
		actionId: projectile.actionId,
		actor: projectile.target,
		localAction: projectile.action,
		runtime: combat.runtime
	});
	const fragments = impactFragments(result.damage);
	combat.runtime.bus.emit('combat:impact', eventPayload(
		projectile,
		position,
		fragments,
		result
	));
	if (result.defeated) combat.reward(projectile.target.profile.xpReward);
	return { fragments, pending: false, result };
}

function eventPayload(projectile, position, fragments, result) {
	return {
		...result,
		actionId: projectile.actionId,
		impactFragments: fragments,
		label: projectile.action.label,
		letters: projectile.action.letters,
		position,
		targetId: projectile.target.profile.id
	};
}

function impactFragments(damage) {
	return Math.min(
		12,
		7 + Math.ceil(Math.max(0, Number(damage || 0)) / 3)
	);
}
