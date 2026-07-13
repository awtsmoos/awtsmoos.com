// B"H
// Boruch Hashem
// Blessed is He

import { debateFx } from './debateEffects.js';
import { emitBattleEvent } from './battleEvents.js';
import { getBattleUIPayload } from './utils.js';

function recruitOpponent(state) {
	const member = { id: state.battle.opponent.id, level: state.battle.opponent.level };
	if (state.player.team.length < 6) state.player.team.push(member);
	else state.player.storage.push(member);
	state.battle.captured = true;
	state.battle.winner = 'player';
	emitBattleEvent(state, { type: 'recruit_musag', targetId: member.id, quantity: 1 });
	emitBattleEvent(state, { type: 'research_or_recruit', targetId: member.id, quantity: 1 });
	emitBattleEvent(state, { type: 'resolve_encounter', targetId: member.id, quantity: 1 });
}

function attemptRecruitment(state, item, sendUIUpdate) {
	const opponent = state.battle.opponent;
	const healthFactor = (opponent.maxHp - opponent.currentHp) / opponent.maxHp;
	const statusBonus = opponent.status ? 0.15 : 0;
	const knowledgeBonus = state.player.bestiary?.[opponent.id] ? 0.1 : 0;
	const chance = Math.min(0.95, (item.captureRate || 0.45) + (healthFactor * 0.4) + statusBonus + knowledgeBonus);
	if (Math.random() <= chance) {
		state.battle.log += ' Befriended!';
		recruitOpponent(state);
		sendUIUpdate({ fx: debateFx('capture') });
	} else {
		state.battle.log += ' The bond did not yet hold.';
		state.battle.turn = 'opponent';
	}
}

function applyConsumable(state, item, sendUIUpdate) {
	const effect = item.effect || {};
	const healAmount = effect.amount || effect.hp || 0;
	if (healAmount > 0) {
		const multiplier = state.battle.gateEffects.healMult || 1;
		const healing = Math.floor(healAmount * multiplier);
		state.battle.player.currentHp = Math.min(state.battle.player.maxHp, state.battle.player.currentHp + healing);
		sendUIUpdate({ fx: { type: 'floatingText', text: `+${healing}`, style: 'float-heal', x: 'player' } });
	}
	if (effect.cure || effect.status) state.battle.player.status = null;
	state.battle.turn = 'opponent';
}

/** Uses exactly one inventory item and distinguishes recruitment from defeat. */
export function useBattleItem(state, itemId, sendUIUpdate) {
	const item = state.db.items[itemId];
	const index = state.player.inventory.findIndex(entry => entry.id === itemId);
	if (!item || index < 0) return false;
	state.player.inventory.splice(index, 1);
	state.battle.metrics.itemsUsed += 1;
	state.battle.log = `You used ${item.name}.`;
	emitBattleEvent(state, { type: 'use_item', targetId: itemId, quantity: 1 });
	if (item.type === 'kli' || item.type === 'recruitment') attemptRecruitment(state, item, sendUIUpdate);
	else applyConsumable(state, item, sendUIUpdate);
	state.battle.awaitingConfirm = true;
	sendUIUpdate({ battle: getBattleUIPayload(state.battle, false, [], state) });
	return true;
}
