// B"H
// Boruch Hashem
// Blessed is He

import { getBattleUIPayload } from './utils.js';

function showActionMenu(state, sendUIUpdate) {
	sendUIUpdate({ battle: getBattleUIPayload(state.battle, true, [
		{ action: 'fight', text: 'Debate' },
		{ action: 'bag', text: 'Satchel' },
		{ action: 'flee', text: 'Concede' }
	], state) });
}

function showMovesMenu(state, sendUIUpdate) {
	const buttons = state.battle.player.moves.map(moveId => {
		const move = state.db.moves[moveId];
		if (!move) return { action: 'back', text: 'Unknown', disabled: true };
		return { action: 'move', value: moveId, text: `${move.name} (${move.cost})`, disabled: state.battle.player.currentKavanah < move.cost };
	});
	buttons.push({ action: 'back', text: 'Back' });
	sendUIUpdate({ battle: getBattleUIPayload(state.battle, true, buttons, state) });
}

function showItemMenu(state, sendUIUpdate) {
	const validTypes = new Set(['consumable', 'kli', 'recruitment']);
	const itemIds = [...new Set(state.player.inventory.filter(item => validTypes.has(item.type)).map(item => item.id))];
	const buttons = itemIds.map(itemId => ({
		action: 'use_item',
		value: itemId,
		text: `${state.db.items[itemId].name} (x${state.player.inventory.filter(item => item.id === itemId).length})`
	}));
	buttons.push({ action: 'back', text: 'Back' });
	sendUIUpdate({ battle: getBattleUIPayload(state.battle, true, buttons, state) });
}

function confirmPreviousAction(state, sendUIUpdate, trigger) {
	state.battle.awaitingConfirm = false;
	if (state.battle.winner) trigger.endBattle(state.battle.winner === 'player');
	else if (state.battle.turn === 'player') showActionMenu(state, sendUIUpdate);
	else trigger.runOpponentTurn();
}

function attemptEscape(state, sendUIUpdate, trigger) {
	if (Math.random() > 0.3) {
		state.battle.log = 'You conceded the debate.';
		state.battle.winner = 'fled';
		state.battle.awaitingConfirm = true;
		sendUIUpdate({ battle: getBattleUIPayload(state.battle, false, [], state) });
		trigger.endBattle(false);
	} else {
		state.battle.log = 'You failed to withdraw!';
		state.battle.awaitingConfirm = true;
		state.battle.turn = 'opponent';
		sendUIUpdate({ battle: getBattleUIPayload(state.battle, false, [], state) });
	}
}

/** Routes the player's readable battle menu into one owned action. */
export function handlePlayerAction(state, data, sendUIUpdate, trigger, executeTurn) {
	if (state.battle.awaitingConfirm && data.action === 'confirm') {
		confirmPreviousAction(state, sendUIUpdate, trigger);
		return;
	}
	if (state.battle.awaitingConfirm || state.battle.turn !== 'player') return;
	if (data.action === 'fight') showMovesMenu(state, sendUIUpdate);
	else if (data.action === 'bag') showItemMenu(state, sendUIUpdate);
	else if (data.action === 'use_item') trigger.useItem(data.value);
	else if (data.action === 'back') showActionMenu(state, sendUIUpdate);
	else if (data.action === 'move') executeTurn(state, data.value, false, sendUIUpdate, trigger);
	else if (data.action === 'flee') attemptEscape(state, sendUIUpdate, trigger);
}
