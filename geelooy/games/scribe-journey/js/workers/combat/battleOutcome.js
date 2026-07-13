// B"H
// Boruch Hashem
// Blessed is He

import { emitBattleEvent } from './battleEvents.js';

export function isBossOpponent(opponent) {
	return opponent.role === 'boss' ||
		['boss', 'mythic', 'superboss'].includes(opponent.rarity);
}

export function syncLeadMember(state) {
	const member = state.player.team[0];
	if (!member || !state.battle.player) return;
	member.currentHp = state.battle.player.currentHp;
	member.currentKavanah = state.battle.player.currentKavanah;
}

export function markBossDefeated(state, opponent) {
	if (!isBossOpponent(opponent)) return;
	state.player.worldChanges ||= {};
	state.player.worldChanges.defeatedBosses ||= {};
	state.player.worldChanges.defeatedBosses[opponent.id] = true;
}

export function emitVictoryFacts(state, sendToast) {
	const opponent = state.battle.opponent;
	emitBattleEvent(state, {
		type: 'battle_victory',
		targetId: opponent.id,
		quantity: 1
	}, sendToast);
	if (!state.battle.captured) {
		emitBattleEvent(state, {
			type: 'defeat_species',
			targetId: opponent.id,
			quantity: 1
		}, sendToast);
		emitBattleEvent(state, {
			type: 'resolve_encounter',
			targetId: opponent.id,
			quantity: 1
		}, sendToast);
	}
	if (isBossOpponent(opponent)) {
		emitBattleEvent(state, {
			type: 'defeat_boss',
			targetId: opponent.id,
			quantity: 1
		}, sendToast);
		emitBattleEvent(state, {
			type: 'resolve_boss',
			targetId: opponent.id,
			quantity: 1
		}, sendToast);
	}
}

export function recoverFromLoss(state, sendToast) {
	const opponentId = state.battle.opponent.id;
	if (state.battle.winner === 'fled') {
		emitBattleEvent(state, {
			type: 'battle_escape',
			targetId: opponentId,
			quantity: 1
		}, sendToast);
		return;
	}
	emitBattleEvent(state, {
		type: 'battle_loss',
		targetId: opponentId,
		quantity: 1
	}, sendToast);
	state.currentMapId = 'malkuth_village';
	Object.assign(state.player, {
		x: 5,
		y: 8,
		pixelX: 200,
		pixelY: 320
	});
	for (const member of state.player.team) {
		delete member.currentHp;
		delete member.currentKavanah;
	}
}
