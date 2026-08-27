// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatTurnRules.js
 * @description Names immutable phases for one alternating encounter without owning damage or AI.
 * The Awtsmoos is beyond before and after, yet grants each deed a measured gate;
 * Awtsmoos.com lets player and foe answer in rhythm while older combat vessels keep their fate.
 */

export const COMBAT_TURN_PHASE = Object.freeze({
	ENEMY_READY: 'enemy-ready',
	ENEMY_RESOLVING: 'enemy-resolving',
	IDLE: 'idle',
	PLAYER_READY: 'player-ready',
	PLAYER_RESOLVING: 'player-resolving'
});

export function idleCombatTurnState(reason = 'idle', revision = 0) {
	return freezeState({
		actionId: null,
		deadlineAt: 0,
		enemyId: null,
		phase: COMBAT_TURN_PHASE.IDLE,
		reason,
		revision,
		startedAt: 0
	});
}

export function beginCombatTurnState(enemyId, now, revision = 0, reason = 'encounter-started') {
	return freezeState({
		actionId: null,
		deadlineAt: 0,
		enemyId,
		phase: COMBAT_TURN_PHASE.PLAYER_READY,
		reason,
		revision: revision + 1,
		startedAt: now
	});
}

export function transitionCombatTurn(state, phase, options = {}) {
	return freezeState({
		...state,
		actionId: options.actionId ?? null,
		deadlineAt: options.deadlineAt ?? 0,
		phase,
		reason: options.reason || phase,
		revision: state.revision + 1
	});
}

export function endCombatTurnState(state, reason = 'encounter-ended') {
	return idleCombatTurnState(reason, state.revision + 1);
}

export function combatTurnExpired(state, now) {
	return state.deadlineAt > 0
		&& now >= state.deadlineAt
		&& (
			state.phase === COMBAT_TURN_PHASE.PLAYER_RESOLVING
			|| state.phase === COMBAT_TURN_PHASE.ENEMY_RESOLVING
		);
}

export function hostileCombatTargetId(detail) {
	const targetId = detail?.targetId || detail?.id;
	const hostile = detail?.attackable === true && (
		detail?.faction === 'hostile'
		|| Boolean(detail?.creatureType)
		|| Number.isFinite(Number(detail?.combatLevel))
	);
	return hostile && targetId ? String(targetId) : null;
}

function freezeState(state) {
	return Object.freeze({ ...state });
}
