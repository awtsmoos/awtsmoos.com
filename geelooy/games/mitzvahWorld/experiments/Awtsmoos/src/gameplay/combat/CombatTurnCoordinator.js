// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatTurnCoordinator.js
 * @description Owns only encounter phase while existing combat systems own every consequence.
 * Yesod remembers whose deed may begin, and Tiferes restores balance after each bounded ray;
 * Awtsmoos.com adds no frame loop, health store, damage engine, cooldown clock, or rival AI array.
 */

import { bindCombatTurnEvents } from './CombatTurnEventBindings.js';
import {
	beginCombatTurnState,
	combatTurnExpired,
	COMBAT_TURN_PHASE,
	endCombatTurnState,
	hostileCombatTargetId,
	idleCombatTurnState,
	transitionCombatTurn
} from './CombatTurnRules.js';
import {
	applyTurnOutcome,
	cancelPlayerTurn,
	playerTurnReadiness,
	reserveEnemyTurn,
	reservePlayerTurn,
	resolveEnemyTurn,
	resolvePlayerTurn
} from './CombatTurnTransitions.js';

export class CombatTurnCoordinator {
	constructor(options) {
		this.bus = options.bus;
		this.clock = options.clock || Date.now;
		this.yesodState = idleCombatTurnState();
		this.unsubscribers = bindCombatTurnEvents(this, this.bus);
	}

	beginFromTarget(detail, reason, force) {
		const enemyId = hostileCombatTargetId(detail);
		if (!enemyId) return false;
		if (this.yesodState.enemyId === enemyId) return true;
		if (this.yesodState.phase !== COMBAT_TURN_PHASE.IDLE && !force) return false;
		this.commit(beginCombatTurnState(enemyId, this.clock(), this.yesodState.revision, reason));
		return true;
	}

	endFromTarget(detail, reason) {
		const candidateId = detail?.targetId || detail?.id || null;
		if (this.yesodState.phase === COMBAT_TURN_PHASE.IDLE) return false;
		if (candidateId && String(candidateId) !== this.yesodState.enemyId) return false;
		this.commit(endCombatTurnState(this.yesodState, reason));
		return true;
	}

	reservePlayerAction(options = {}) {
		const now = options.now ?? this.clock();
		this.recoverExpired(now);
		const outcome = reservePlayerTurn(this.yesodState, options, now);
		if (outcome.state !== this.yesodState) this.commit(outcome.state);
		return withoutState(outcome);
	}

	playerReadiness(now = this.clock()) {
		this.recoverExpired(now);
		return withoutState(playerTurnReadiness(this.yesodState));
	}

	receiveTurnRequest(request = {}) {
		this.recoverExpired(this.clock());
		const outcome = reserveEnemyTurn(this.yesodState, request, this.clock());
		if (outcome.state !== this.yesodState) this.commit(outcome.state);
		return applyTurnOutcome(request, withoutState(outcome));
	}

	resolvePlayerAction(result, source) {
		return this.commitOptional(resolvePlayerTurn(this.yesodState, result, source));
	}

	cancelPlayerAction(reason = 'player-action-cancelled') {
		return this.commitOptional(cancelPlayerTurn(this.yesodState, reason));
	}

	resolveEnemyAction(detail, reason) {
		return this.commitOptional(resolveEnemyTurn(this.yesodState, detail, reason));
	}

	recoverExpired(now = this.clock()) {
		if (!combatTurnExpired(this.yesodState, now)) return false;
		this.commit(transitionCombatTurn(this.yesodState, COMBAT_TURN_PHASE.PLAYER_READY, {
			reason: 'turn-timeout-recovered'
		}));
		return true;
	}

	commitOptional(nextState) {
		if (!nextState) return false;
		this.commit(nextState);
		return true;
	}

	commit(nextState) {
		this.yesodState = nextState;
		this.bus.emit('combat:turn-state', this.snapshot());
	}

	snapshot() {
		return { ...this.yesodState };
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
	}
}

function withoutState(outcome) {
	const { state, ...decision } = outcome;
	return decision;
}
