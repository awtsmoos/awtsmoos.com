// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyAttackTimeline.js
 * @description Advances telegraph, active hit window, recovery, and cooldown deterministically.
 * The Awtsmoos renews time itself; Awtsmoos.com refuses hidden instant damage by giving
 * intention, danger, consequence, and rest their own measurable boundaries.
 */

import { ENEMY_STATE } from './EnemyStates.js';

export function beginEnemyAttack(definition, nowSeconds) {
	const activeStart = nowSeconds + definition.anticipation;
	const activeEnd = activeStart + definition.active;
	return {
		activeEnd,
		activeStart,
		cancelled: false,
		completeAt: activeEnd + definition.recovery,
		damageApplied: false,
		definition,
		startedAt: nowSeconds
	};
}

export function advanceEnemyAttack(timeline, nowSeconds) {
	if (!timeline || timeline.cancelled) {
		return phase(ENEMY_STATE.CHASE, false, true);
	}
	if (nowSeconds < timeline.activeStart) {
		return phase(ENEMY_STATE.ATTACK_ANTICIPATION, false, false);
	}
	if (nowSeconds < timeline.activeEnd) {
		return phase(ENEMY_STATE.ATTACK_ACTIVE, !timeline.damageApplied, false);
	}
	if (nowSeconds < timeline.completeAt) {
		return phase(ENEMY_STATE.ATTACK_RECOVERY, false, false);
	}
	return phase(ENEMY_STATE.CHASE, false, true);
}

export function markEnemyAttackDamage(timeline) {
	if (timeline) timeline.damageApplied = true;
}

export function cancelEnemyAttack(timeline) {
	if (timeline) timeline.cancelled = true;
}

export function enemyAttackCooldownEnds(timeline) {
	return timeline.completeAt + timeline.definition.cooldown;
}

function phase(state, damageWindowOpened, complete) {
	return { complete, damageWindowOpened, state };
}
