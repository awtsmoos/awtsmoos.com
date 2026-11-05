// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyStates.js
 * @description Names the complete hostile lifecycle without coupling policy to rendering.
 * The Awtsmoos renews every apparent transition; Awtsmoos.com gives each finite state
 * a clear vessel so movement, combat, animation, and diagnostics speak one language.
 */

export const ENEMY_STATE = Object.freeze({
	ALERT: 'Alert',
	APPROACH: 'Approach',
	ATTACK_ACTIVE: 'AttackActive',
	ATTACK_ANTICIPATION: 'AttackAnticipation',
	ATTACK_RECOVERY: 'AttackRecovery',
	CHASE: 'Chase',
	CIRCLE: 'Circle',
	DEFEATED: 'Defeated',
	DESPAWN: 'Despawn',
	DORMANT: 'Dormant',
	HIT_REACTION: 'HitReaction',
	IDLE: 'Idle',
	INVESTIGATE: 'Investigate',
	PATROL: 'Patrol',
	RESPAWN_COOLDOWN: 'RespawnCooldown',
	RETREAT: 'Retreat',
	RETURN_HOME: 'ReturnHome',
	SPAWN: 'Spawn',
	STAGGER: 'Stagger',
	WANDER: 'Wander'
});

const URGENT_STATES = new Set([
	ENEMY_STATE.ALERT,
	ENEMY_STATE.APPROACH,
	ENEMY_STATE.ATTACK_ACTIVE,
	ENEMY_STATE.ATTACK_ANTICIPATION,
	ENEMY_STATE.ATTACK_RECOVERY,
	ENEMY_STATE.CHASE,
	ENEMY_STATE.CIRCLE,
	ENEMY_STATE.HIT_REACTION,
	ENEMY_STATE.RETREAT,
	ENEMY_STATE.RETURN_HOME,
	ENEMY_STATE.STAGGER
]);

export function enemyStateIsUrgent(state) {
	return URGENT_STATES.has(state);
}
