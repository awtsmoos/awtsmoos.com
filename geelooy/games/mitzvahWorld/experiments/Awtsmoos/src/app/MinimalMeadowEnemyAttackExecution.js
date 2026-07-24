// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyAttackExecution.js
 * @description Commits exactly one melee impact or Hebrew projectile before recovery.
 * The Awtsmoos separates intention from consequence; Awtsmoos.com makes each impact
 * range-gated, each launch singular, and every cooldown a return to continued pressure.
 */

import { createImpactExplosion } from './MinimalMeadowParticleEffects.js';
import { addEnemyEffect } from './MinimalMeadowEnemyCombatEffects.js';
import { applyMinimalEnemyDamage } from './MinimalMeadowEnemyDamage.js';
import { createEnemyHebrewProjectile } from './MinimalMeadowEnemyProjectile.js';
import { minimalEnemyPerception } from './MinimalMeadowEnemyNavigation.js';

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
	if (perception.distance > 2.9) {
		combat.runtime.bus.emit('enemy:miss', {
			enemy: combat.actor.payload(),
			reason: 'impact-out-of-range'
		});
		return false;
	}
	combat.attackCount += 1;
	const position = playerImpactPosition(combat.runtime);
	addEnemyEffect(combat, createImpactExplosion(position, RED, 12));
	const receipt = applyMinimalEnemyDamage(combat.runtime, 12, { letters: 'מכה', mode: 'melee' });
	combat.runtime.bus.emit('enemy:melee', { ...receipt, position, role: combat.session.role });
	return true;
}

export function launchEnemyRangedAttack(combat) {
	if (combat.launched) return false;
	combat.launched = true;
	const projectile = createEnemyHebrewProjectile(combat.actor, combat.runtime);
	combat.projectiles.push(projectile);
	combat.runtime.scene.add(projectile.group);
	combat.runtime.bus.emit('enemy:projectile', {
		enemyId: combat.actor.profile.id,
		letters: 'דין',
		role: combat.session.role
	});
	combat.attackCount += 1;
	finishEnemyAttack(combat, 1.85, 'cast-released');
	return true;
}

export function finishEnemyAttack(combat, cooldown, reason = 'attack-recovered') {
	combat.action = null;
	combat.actionTime = 0;
	combat.cooldown = cooldown + combat.session.openingDelay * 0.35;
	combat.struck = false;
	combat.launched = false;
	combat.actor.action = 'idle';
	combat.actor.actionProgress = 0;
	combat.actor.moving = false;
	combat.session.transition('recovery', reason);
}

function playerImpactPosition(runtime) {
	return { x: runtime.state.x, y: runtime.state.renderY + 1, z: runtime.state.z };
}
