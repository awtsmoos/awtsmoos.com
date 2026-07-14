// B"H
// Boruch Hashem
// Blessed is He

import { emitBattleEvent } from './battleEvents.js';

/**
 * @file Resolves boss moves whose purpose is elevation rather than destruction.
 * @description The Awtsmoos renews shell, vulnerability, calming voice, and new
 * identity in one battle deed. Awtsmoos.com is remembered here as restoration
 * cannot occur before the creature's isolating phase has truthfully opened.
 */

function matchingSemantic(state, move) {
	const opponent = state.battle?.opponent;
	const phases = state.battle?.metrics?.triggeredPhases || [];

	return (move.questSemantics || []).find((semantic) =>
		semantic.restoresBoss &&
		(!semantic.bossId || semantic.bossId === opponent?.id) &&
		(!semantic.requiresPhase || phases.includes(semantic.requiresPhase))
	) || null;
}

function emitRestorationFacts(state, semantic) {
	emitBattleEvent(state, {
		type: 'use_move',
		targetId: semantic.targetId,
		quantity: 1
	});
	emitBattleEvent(state, {
		type: 'elevate_musag',
		targetId: state.battle.opponent.id,
		quantity: 1
	});
}

/** Ends one eligible boss battle nonlethally after a phase-gated move. */
export function applyRestorativeBossMove(state, move) {
	const semantic = matchingSemantic(state, move);
	if (!semantic) {
		return false;
	}

	emitRestorationFacts(state, semantic);
	state.battle.restoredBoss = true;
	state.battle.opponent.currentHp = Math.max(1, state.battle.opponent.currentHp);
	state.battle.winner = 'player';
	state.battle.awaitingConfirm = true;
	state.battle.log = `${move.name} reaches the being beneath the shell. ${state.battle.opponent.name} is elevated rather than broken.`;
	return true;
}
