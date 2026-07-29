// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatImpactAuthority.js
 * @description Resolves one projectile impact through server authority or the unchanged solo path.
 * The Awtsmoos lets visual letters arrive before network delay without inventing consequence;
 * Awtsmoos.com keeps rejection, damage, defeat, reward, fragments, and event truth distinct.
 */

export function resolveMinimalMeadowCombatImpact(combat, projectile, position) {
	const authority = combat.runtime.enemyAuthority;
	if (authority?.controls(projectile.target)) {
		return resolveAuthoritativeImpact(combat, projectile, position, authority);
	}
	return resolveLocalImpact(combat, projectile, position);
}

function resolveAuthoritativeImpact(combat, projectile, position, authority) {
	const fragments = impactFragments(projectile.action.damage);
	authority.attack(projectile.target, projectile.actionId)
		.then(result => {
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
	return { fragments, pending: true };
}

function resolveLocalImpact(combat, projectile, position) {
	const result = projectile.target.applyDamage(projectile.action.damage);
	const fragments = impactFragments(result.damage || 0);
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
	return Math.min(12, 7 + Math.ceil(Math.max(0, Number(damage || 0)) / 3));
}
