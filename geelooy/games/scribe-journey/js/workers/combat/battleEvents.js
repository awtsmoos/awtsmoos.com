// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../quests.js';

export function createBattleMetrics() {
	return {
		turns: 0,
		playerMoves: {},
		moveTypes: [],
		triggeredPhases: [],
		itemsUsed: 0
	};
}

export function emitBattleEvent(state, event, sendToast = null) {
	return Quests.emit(state, { ...event, mapId: state.currentMapId }, sendToast);
}

export function recordPlayerMove(state, moveId, move) {
	const metrics = state.battle.metrics;
	metrics.turns += 1;
	metrics.playerMoves[moveId] = (metrics.playerMoves[moveId] || 0) + 1;
	const category = move.category || move.type || 'untyped';
	if (!metrics.moveTypes.includes(category)) metrics.moveTypes.push(category);
	emitBattleEvent(state, { type: 'use_move', targetId: moveId, quantity: 1 });
	emitBattleEvent(state, { type: 'use_move_category', targetId: category, quantity: 1 });
}

function phaseKey(phase) {
	return phase.key || phase.id || phase.targetId;
}

export function emitHealthThresholds(state) {
	const battle = state.battle;
	const opponent = battle.opponent;
	const ratio = opponent.currentHp / opponent.maxHp;
	if (ratio <= 0.35 && !battle.metrics.triggeredPhases.includes('below_35')) {
		battle.metrics.triggeredPhases.push('below_35');
		emitBattleEvent(state, { type: 'battle_condition', targetId: `${opponent.id}_below_35`, quantity: 1 });
	}
	for (const phase of opponent.bossPhases || []) {
		const key = phaseKey(phase);
		if (ratio > phase.threshold || battle.metrics.triggeredPhases.includes(key)) continue;
		battle.metrics.triggeredPhases.push(key);
		emitBattleEvent(state, {
			type: 'defeat_boss_phase',
			targetId: phase.targetId || phase.id,
			quantity: Number(phase.quantity || 1)
		});
		battle.log += ` ${phase.text || `${opponent.name} changes phase!`}`;
	}
}
