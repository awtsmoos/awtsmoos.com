// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyAttackExecution.js
 * @description Commits one policy-sized melee impact or one cadenced Hebrew projectile.
 * The Awtsmoos separates intention from consequence; Awtsmoos.com makes each strike
 * range-gated, slot-owned, telegraphed, singular, and followed by policy-owned recovery.
 */

import { MINIMAL_MEADOW_COMBAT_BALANCE as POLICY } from './MinimalMeadowCombatBalancePolicy.js';
import { addEnemyEffect } from './MinimalMeadowEnemyCombatEffects.js';
import { applyMinimalEnemyDamage } from './MinimalMeadowEnemyDamage.js';
import { createEnemyHebrewProjectile } from './MinimalMeadowEnemyProjectile.js';
import { minimalEnemyPerception } from './MinimalMeadowEnemyNavigation.js';
import { createImpactExplosion } from './MinimalMeadowParticleEffects.js';

const RED = Object.freeze([1, 0.06, 0.08, 1]);

export function beginEnemyMeleeStrike(combat) {
	combat.session.transition('melee-impact', 'windup-complete');
	combat.action = 'melee-strike';
	combat.actionTime = 0;
	combat.struck = false;
	combat.actor.action = combat.action;
	return true;
}

export function executeEnemyMeleeImpact(combat) {
	if (combat.struck) return false;
	combat.struck = true;
	const perception = minimalEnemyPerception(combat);
	if (perception.distance > 2.9) return emitMiss(combat, 'impact-out-of-range');
	combat.attackCount += 1;
	const position = playerImpactPosition(combat.runtime);
	addEnemyEffect(combat, createImpactExplosion(position, RED, 12));
	const receipt = applyMinimalEnemyDamage(combat.runtime, POLICY.damage.melee, {
		enemyId: combat.actor.profile.id,
		letters: 'מכה',
		mode: 'melee'
	});
	combat.runtime.bus.emit('enemy:melee', {
		...receipt,
		position,
		role: combat.session.role
	});
	return receipt.accepted !== false;
}

export function launchEnemyRangedAttack(combat) {
	if (combat.launched) return false;
	combat.launched = true;
	const projectile = createEnemyHebrewProjectile(combat.actor, combat.runtime);
	projectile.damage = POLICY.damage.ranged;
	combat.projectiles.push(projectile);
	combat.runtime.scene.add(projectile.group);
	combat.runtime.bus.emit('enemy:projectile', {
		enemyId: combat.actor.profile.id,
		letters: 'דין',
		role: combat.session.role
	});
	combat.attackCount += 1;
	finishEnemyAttack(combat, null, 'cast-released');
	return true;
}

export function finishEnemyAttack(combat, _legacyCooldown, reason = 'attack-recovered') {
	const mode = combat.session.role === 'caster' ? 'ranged' : 'melee';
	combat.releaseAttackSlot?.();
	combat.action = null;
	combat.actionTime = 0;
	combat.cooldown = POLICY.cooldowns[mode] + combat.session.openingDelay * 0.35;
	combat.struck = false;
	combat.launched = false;
	combat.actor.action = 'idle';
	combat.actor.actionProgress = 0;
	combat.actor.moving = false;
	combat.session.transition('recovery', reason);
}

function emitMiss(combat, reason) {
	combat.runtime.bus.emit('enemy:miss', {
		enemy: combat.actor.payload(),
		reason
	});
	return false;
}

function playerImpactPosition(runtime) {
	return {
		x: runtime.state.x,
		y: runtime.state.renderY + 1,
		z: runtime.state.z
	};
}
