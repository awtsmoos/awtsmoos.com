// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyRangedExecution.js
 * @description Launches one readable role projectile carrying exact action and phase identity.
 * The Awtsmoos gives a traveling letter its source, warning, and measured consequence;
 * Awtsmoos.com preserves speed, damage, shape, danger, concealment, role, and owner evidence.
 */

import {
	minimalEnemyAttackDamage,
	minimalEnemyAttackLetters
} from './MinimalMeadowEnemyAttackPolicy.js';
import { createEnemyHebrewProjectile } from './MinimalMeadowEnemyProjectile.js';

export function launchEnemyCast(combat) {
	if (combat.launched) return false;
	combat.launched = true;
	const action = combat.currentAction || {};
	const projectile = createEnemyHebrewProjectile(
		combat.actor,
		combat.runtime,
		action
	);
	projectile.damage = minimalEnemyAttackDamage(combat, 'ranged');
	combat.projectiles.push(projectile);
	combat.runtime.scene.add(projectile.group);
	combat.runtime.bus.emit('enemy:projectile', {
		actionId: action.id,
		archetype: combat.actor.profile.archetype,
		concealed: Boolean(action.concealed),
		danger: action.danger,
		enemyId: combat.actor.profile.id,
		letters: minimalEnemyAttackLetters(combat),
		phase: action.phase,
		role: combat.actor.profile.role,
		shape: action.shape,
		speed: projectile.action.speed
	});
	return true;
}

export function finishEnemyCast(combat) {
	combat.runtime.bus.emit('enemy:cast-complete', {
		actionId: combat.currentAction?.id,
		enemyId: combat.actor.profile.id,
		phase: combat.currentAction?.phase,
		role: combat.actor.profile.role
	});
	return true;
}
