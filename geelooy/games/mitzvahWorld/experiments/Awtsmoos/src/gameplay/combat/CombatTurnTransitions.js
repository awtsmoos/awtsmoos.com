// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatTurnTransitions.js
 * @description Computes alternating encounter transitions without owning events, clocks, or consequences.
 * The Awtsmoos holds player and foe inside one measured Tiferes, where each Gevurah answers in time;
 * Awtsmoos.com returns immutable state and explicit decisions, so no hidden combat authority can climb.
 */

import {
	COMBAT_TURN_PHASE,
	transitionCombatTurn
} from './CombatTurnRules.js';

const PLAYER_RECOVERY_GRACE_MILLISECONDS = 3000;
const ENEMY_RESOLUTION_MILLISECONDS = 8000;

export function playerTurnReadiness(yesodState) {
	if (yesodState.phase === COMBAT_TURN_PHASE.IDLE) {
		return turnOutcome(yesodState, true, 'free-action', false);
	}
	const ready = yesodState.phase === COMBAT_TURN_PHASE.PLAYER_READY;
	return turnOutcome(
		yesodState,
		ready,
		ready ? 'player-ready' : 'not-player-turn',
		true
	);
}

export function reservePlayerTurn(yesodState, options, now) {
	const readiness = playerTurnReadiness(yesodState);
	if (!readiness.ok || !readiness.tracked) return readiness;
	const duration = Math.max(0, Number(options.durationMilliseconds || 0));
	const nextState = transitionCombatTurn(yesodState, COMBAT_TURN_PHASE.PLAYER_RESOLVING, {
		actionId: options.actionId || null,
		deadlineAt: now + duration + PLAYER_RECOVERY_GRACE_MILLISECONDS,
		reason: options.reason || 'player-action-reserved'
	});
	return turnOutcome(nextState, true, 'player-action-reserved', true);
}

export function resolvePlayerTurn(yesodState, result, source) {
	if (yesodState.phase !== COMBAT_TURN_PHASE.PLAYER_RESOLVING) return null;
	const accepted = result?.ok !== false && result?.accepted !== false;
	const phase = accepted
		? COMBAT_TURN_PHASE.ENEMY_READY
		: COMBAT_TURN_PHASE.PLAYER_READY;
	return transitionCombatTurn(yesodState, phase, {
		reason: accepted ? `${source}-resolved` : `${source}-rejected`
	});
}

export function cancelPlayerTurn(yesodState, reason) {
	if (yesodState.phase !== COMBAT_TURN_PHASE.PLAYER_RESOLVING) return null;
	return transitionCombatTurn(yesodState, COMBAT_TURN_PHASE.PLAYER_READY, { reason });
}

export function reserveEnemyTurn(yesodState, request, now) {
	if (request.side !== 'enemy') {
		return turnOutcome(yesodState, false, 'unsupported-turn-side', true);
	}
	if (yesodState.phase === COMBAT_TURN_PHASE.IDLE) {
		return turnOutcome(yesodState, true, 'free-enemy-action', false);
	}
	if (String(request.actorId || '') !== yesodState.enemyId) {
		return turnOutcome(yesodState, false, 'different-enemy-turn', true);
	}
	if (yesodState.phase !== COMBAT_TURN_PHASE.ENEMY_READY) {
		return turnOutcome(yesodState, false, 'not-enemy-turn', true);
	}
	const nextState = transitionCombatTurn(yesodState, COMBAT_TURN_PHASE.ENEMY_RESOLVING, {
		actionId: request.actionId || null,
		deadlineAt: now + ENEMY_RESOLUTION_MILLISECONDS,
		reason: 'enemy-action-reserved'
	});
	return turnOutcome(nextState, true, 'enemy-action-reserved', true);
}

export function resolveEnemyTurn(yesodState, detail, reason) {
	if (yesodState.phase !== COMBAT_TURN_PHASE.ENEMY_RESOLVING) return null;
	const actorId = detail?.enemy?.targetId || detail?.targetId || detail?.id || null;
	if (actorId && String(actorId) !== yesodState.enemyId) return null;
	return transitionCombatTurn(yesodState, COMBAT_TURN_PHASE.PLAYER_READY, { reason });
}

export function applyTurnOutcome(request, outcome) {
	Object.assign(request, outcome, { accepted: outcome.ok });
	return request;
}

function turnOutcome(state, ok, reason, tracked) {
	return {
		ok,
		phase: state.phase,
		reason,
		state,
		tracked
	};
}
