// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyAttackExecution.js
 * @description Executes elbow strike, Hebrew projectile launch, impact particles, and recovery.
 * The Awtsmoos separates decision from consequence; Awtsmoos.com makes range, damage, glyph,
 * explosion, cooldown, and animation recovery independently testable without enlarging the AI.
 */

import { enemyDistanceToPlayer } from './MinimalMeadowEnemyCombatDecision.js?v=20260724-meadow-13';
import { createImpactExplosion } from './MinimalMeadowParticleEffects.js?v=20260724-meadow-13';
import { addEnemyEffect } from './MinimalMeadowEnemyCombatEffects.js?v=20260724-meadow-13';
import { applyMinimalEnemyDamage } from './MinimalMeadowEnemyDamage.js?v=20260724-meadow-13';
import { createEnemyHebrewProjectile } from './MinimalMeadowEnemyProjectile.js?v=20260724-meadow-13';

const RED = Object.freeze([1, 0.015, 0.025, 1]);

export function beginEnemyMeleeStrike(combat) {
	combat.action = 'melee-strike';
	combat.actionTime = 0;
	combat.actor.action = combat.action;
	return true;
}

export function executeEnemyMeleeImpact(combat) {
	combat.struck = true;
	if (enemyDistanceToPlayer(combat) > 2.8) return;
	combat.attackCount += 1;
	const position = playerImpactPosition(combat.runtime);
	addEnemyEffect(combat, createImpactExplosion(position, RED, 12));
	const receipt = applyMinimalEnemyDamage(combat.runtime, 12, {
		letters: 'מכה',
		mode: 'melee'
	});
	combat.runtime.bus.emit('enemy:melee', { ...receipt, position });
}

export function launchEnemyRangedAttack(combat) {
	const projectile = createEnemyHebrewProjectile(combat.actor, combat.runtime);
	combat.projectiles.push(projectile);
	combat.runtime.scene.add(projectile.group);
	combat.runtime.bus.emit('enemy:projectile', { letters: 'דין' });
	combat.attackCount += 1;
	finishEnemyAttack(combat, 2.1);
}

export function finishEnemyAttack(combat, cooldown) {
	combat.action = null;
	combat.actionTime = 0;
	combat.cooldown = cooldown;
	combat.struck = false;
	combat.actor.action = 'idle';
	combat.actor.actionProgress = 0;
}

function playerImpactPosition(runtime) {
	return {
		x: runtime.state.x,
		y: runtime.state.renderY + 1,
		z: runtime.state.z
	};
}
