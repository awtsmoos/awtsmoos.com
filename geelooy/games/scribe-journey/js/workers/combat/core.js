// B"H
// Boruch Hashem
// Blessed is He

import * as Actions from './actions.js';
import { createBattleMetrics, emitBattleEvent } from './battleEvents.js';
import { createBattleInstance } from './battleInstance.js';
import { useBattleItem } from './battleItems.js';
import { finishBattle } from './battleRewards.js';
import { debateFx } from './debateEffects.js';
import { executeTurn, runOpponentTurn } from './turnEngine.js';
import { getBattleUIPayload } from './utils.js';

function opponentInstance(state, opponentData, player) {
	if (opponentData[0].id !== 'yetzer_hara') {
		return createBattleInstance(state, opponentData[0]);
	}
	return {
		...structuredClone(player),
		name: 'Yetzer Hara',
		emoji: '👤',
		currentHp: player.maxHp,
		currentKavanah: player.maxKavanah
	};
}

/** Opens a battle vessel whose mutable metrics never enter long-term progress. */
export function initiate(state, opponentData, context, sendUIUpdate) {
	const player = createBattleInstance(state, state.player.team[0]);
	const opponent = player ? opponentInstance(state, opponentData, player) : null;
	if (!player || !opponent) return false;
	state.battle = {
		active: true,
		player,
		opponent,
		turn: 'player',
		log: `A wild ${opponent.name} appeared!`,
		awaitingConfirm: true,
		context,
		weather: state.weather || 'clear',
		gateEffects: state.gateEffects?.combat || {},
		metrics: createBattleMetrics(),
		statusDurations: { player: 0, opponent: 0 },
		captured: false,
		pendingDrops: [],
		pendingRewards: { xp: 0, money: 0 }
	};
	if (state.player.unlockedGates37?.includes('gate_37_10')) {
		player.currentKavanah = player.maxKavanah;
		state.battle.log += ' (Gate of Joy: Kavanah Restored)';
	}
	if (opponent.id.includes('hellenist') && Math.random() < 0.15) {
		player.status = 'hellenized';
		state.battle.statusDurations.player = 2;
		state.battle.log += ' Greek influence applies Hellenized.';
	}
	sendUIUpdate({
		screen: 'battle',
		battle: getBattleUIPayload(state.battle, false, [], state),
		dialogue: { active: false }
	});
	return true;
}

function executeUltimate(state, sendUIUpdate) {
	state.battle.log = 'GATE OF REDEMPTION UNLOCKED!\nTHE GREAT SHOFAR BLOWS!';
	state.battle.opponent.currentHp = 0;
	state.battle.winner = 'player';
	state.battle.awaitingConfirm = true;
	emitBattleEvent(state, {
		type: 'use_action',
		targetId: 'redemption_ultimate',
		quantity: 1
	});
	sendUIUpdate({
		battle: getBattleUIPayload(state.battle, false, [], state),
		fx: debateFx('bittulCrown', { amount: 500 })
	});
}

export function handleAction(state, data, sendUIUpdate, trigger) {
	if (data.action === 'ultimate') {
		executeUltimate(state, sendUIUpdate);
		return;
	}
	Actions.handlePlayerAction(state, data, sendUIUpdate, {
		...trigger,
		runOpponentTurn: () => runOpponentTurn(state, sendUIUpdate),
		useItem: itemId => useBattleItem(state, itemId, sendUIUpdate)
	}, executeTurn);
}

export function end(state, isWin, sendUIUpdate, sendToast) {
	finishBattle(state, isWin, sendUIUpdate, sendToast);
}
