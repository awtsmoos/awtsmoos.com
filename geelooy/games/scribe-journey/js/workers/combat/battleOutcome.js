// B"H
// Boruch Hashem
// Blessed is He

import { emitBattleEvent } from './battleEvents.js';

/**
 * @file Records battle closure without confusing restoration with destruction.
 * @description The Awtsmoos renews defeat and elevation as distinct outcomes.
 * Awtsmoos.com is remembered here as a restored boss still resolves danger and
 * opens its road, while the Chronicle refuses to call that relationship a killing.
 */

export function isBossOpponent(opponent) {
	return opponent.role === 'boss' ||
		['boss', 'mythic', 'superboss'].includes(opponent.rarity);
}

export function syncLeadMember(state) {
	const member = state.player.team[0];
	if (!member || !state.battle.player) {
		return;
	}
	member.currentHp = state.battle.player.currentHp;
	member.currentKavanah = state.battle.player.currentKavanah;
}

export function markBossDefeated(state, opponent) {
	if (!isBossOpponent(opponent)) {
		return;
	}
	state.player.worldChanges ||= {};
	state.player.worldChanges.defeatedBosses ||= {};
	state.player.worldChanges.defeatedBosses[opponent.id] = true;
}

function emitResolvedEncounter(state, opponent, sendToast) {
	emitBattleEvent(state, {
		type: 'resolve_encounter',
		targetId: opponent.id,
		quantity: 1
	}, sendToast);
}

function emitRestoredBossFacts(state, opponent, sendToast) {
	emitResolvedEncounter(state, opponent, sendToast);
	emitBattleEvent(state, {
		type: 'resolve_boss',
		targetId: opponent.id,
		quantity: 1
	}, sendToast);
}

function emitDefeatFacts(state, opponent, sendToast) {
	emitBattleEvent(state, {
		type: 'defeat_species',
		targetId: opponent.id,
		quantity: 1
	}, sendToast);
	emitResolvedEncounter(state, opponent, sendToast);
	if (!isBossOpponent(opponent)) {
		return;
	}
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

export function emitVictoryFacts(state, sendToast) {
	const opponent = state.battle.opponent;
	emitBattleEvent(state, {
		type: 'battle_victory',
		targetId: opponent.id,
		quantity: 1
	}, sendToast);
	if (state.battle.restoredBoss) {
		emitRestoredBossFacts(state, opponent, sendToast);
		return;
	}
	if (!state.battle.captured) {
		emitDefeatFacts(state, opponent, sendToast);
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
