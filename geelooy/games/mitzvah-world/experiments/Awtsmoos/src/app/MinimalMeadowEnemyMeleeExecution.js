// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyMeleeExecution.js
 * @description Commits one readable melee impact with role action, range, damage, and mercy policy.
 * The Awtsmoos separates warning from consequence; Awtsmoos.com keeps distance, posture,
 * guard, letters, particles, typed player defense, role, and miss evidence in one bounded strike.
 */

import { addEnemyEffect } from './MinimalMeadowEnemyCombatEffects.js';
import { applyMinimalEnemyDamage } from './MinimalMeadowEnemyDamage.js';
import {
	minimalEnemyAttackDamage,
	minimalEnemyAttackLetters,
	minimalEnemyMeleeRange,
	minimalEnemyPlayerImpactPosition
} from './MinimalMeadowEnemyAttackPolicy.js';
import { minimalEnemyPerception } from './MinimalMeadowEnemyNavigation.js';
import { createImpactExplosion } from './MinimalMeadowParticleEffects.js';

const RED = Object.freeze([1, 0.06, 0.08, 1]);

export function impactEnemyMelee(combat) {
	if (combat.struck) return false;
	combat.struck = true;
	const perception = minimalEnemyPerception(combat);
	if (perception.distance > minimalEnemyMeleeRange(combat)) {
		return emitMiss(combat, 'impact-out-of-range');
	}
	const position = minimalEnemyPlayerImpactPosition(combat.runtime);
	addEnemyEffect(combat, createImpactExplosion(position, RED, 12));
	const action = combat.currentAction || {};
	const receipt = applyMinimalEnemyDamage(
		combat.runtime,
		minimalEnemyAttackDamage(combat, 'melee'),
		{
			actionId: action.id,
			archetype: combat.actor.profile.archetype,
			danger: action.danger,
			enemyId: combat.actor.profile.id,
			letters: minimalEnemyAttackLetters(combat),
			mode: 'melee',
			phase: action.phase,
			shape: action.shape
		}
	);
	combat.runtime.bus.emit('enemy:melee', {
		...receipt,
		actionId: action.id,
		position,
		role: combat.actor.profile.role
	});
	return receipt.accepted !== false;
}

function emitMiss(combat, reason) {
	combat.runtime.bus.emit('enemy:miss', {
		actionId: combat.currentAction?.id,
		enemy: combat.actor.payload(),
		reason
	});
	return false;
}
