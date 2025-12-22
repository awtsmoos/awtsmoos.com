
// B"H
// js/workers/combat/actions.js
import { getBattleUIPayload } from './utils.js';

export function handlePlayerAction(state, data, sendUIUpdate, trigger, executeTurnFunc) {
    const battle = state.battle;

	if (battle.awaitingConfirm && data.action === 'confirm') {
		battle.awaitingConfirm = false;
		if (battle.winner) {
			trigger.endBattle(battle.winner === 'player');
			return;
		}
		if (battle.turn === 'player') {
			showActionMenu(state, sendUIUpdate);
		} else {
            // Trigger opponent turn via callback
			trigger.runOpponentTurn();
		}
		return;
	}
    
	if (battle.awaitingConfirm || battle.turn !== 'player') return;

	switch (data.action) {
		case 'fight': showMovesMenu(state, sendUIUpdate); break;
        case 'bag': showItemMenu(state, sendUIUpdate); break;
        case 'use_item': trigger.useItem(data.value); break;
		case 'back': showActionMenu(state, sendUIUpdate); break;
		case 'move': executeTurnFunc(state, data.value, false, sendUIUpdate, trigger); break;
		case 'flee':
            if(Math.random() > 0.3) {
                battle.log = "You conceded the debate.";
                battle.winner = 'fled'; 
                battle.awaitingConfirm = true;
                sendUIUpdate({ battle: getBattleUIPayload(battle) });
                trigger.endBattle(false);
            } else {
                battle.log = "You failed to withdraw!";
                battle.awaitingConfirm = true;
                battle.turn = 'opponent';
                sendUIUpdate({ battle: getBattleUIPayload(battle) });
            }
			break;
	}
}

function showActionMenu(state, sendUIUpdate) {
	sendUIUpdate({
		battle: getBattleUIPayload(state.battle, true, [
            { action: 'fight', text: 'Debate' },
            { action: 'bag', text: 'Satchel' },
            { action: 'flee', text: 'Concede' }, 
        ])
	});
}

function showMovesMenu(state, sendUIUpdate) {
	const player = state.battle.player;
	const buttons = player.moves.map(id => {
			const move = state.db.moves[id];
            if(!move) return { action: 'back', text: 'Unknown', disabled: true };
			return {
				action: 'move',
				value: id,
				text: `${move.name} (${move.cost})`,
				disabled: player.currentKavanah < move.cost
			};
		});
	buttons.push({ action: 'back', text: 'Back' });
	sendUIUpdate({ battle: getBattleUIPayload(state.battle, true, buttons) });
}

function showItemMenu(state, sendUIUpdate) {
    const validItems = state.player.inventory.filter(item => item.type === 'consumable' || item.type === 'kli');
    const uniqueItems = [...new Set(validItems.map(i => i.id))];
    const buttons = uniqueItems.map(id => {
        const item = state.db.items[id];
        const count = state.player.inventory.filter(i => i.id === id).length;
        return { action: 'use_item', value: id, text: `${item.name} (x${count})` };
    });
    buttons.push({ action: 'back', text: 'Back' });
    sendUIUpdate({ battle: getBattleUIPayload(state.battle, true, buttons) });
}
