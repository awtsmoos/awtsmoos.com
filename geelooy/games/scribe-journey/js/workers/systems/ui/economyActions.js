// B"H

import * as Crafting from '../../crafting.js';
import { gates37 } from '../../../data/gates_37.js';
import { checkMitzvahs } from '../../../data/mitzvahs.js';
import { getGates37Payload, getGatesPayload, getOtzarPayload } from './payloads.js';

function swapOtzar(state, params, callbacks, trigger) {
	const index = Number(params.index);
	const from = params.from;
	const to = params.to || (from === 'team' ? 'storage' : 'team');
	state.player.storage ||= [];
	if (from === 'team' && to === 'storage') {
		if (state.player.team.length <= 1) return trigger.sendToast('MUST KEEP 1!', 'error');
		state.player.storage.push(state.player.team.splice(index, 1)[0]);
	} else if (from === 'storage' && to === 'team') {
		if (state.player.team.length >= 6) return trigger.sendToast('TEAM FULL!', 'error');
		state.player.team.push(state.player.storage.splice(index, 1)[0]);
	}
	callbacks.onUIUpdate({ screen: 'otzar-screen', otzar: getOtzarPayload(state) });
}

function spinDreidel(state, params, callbacks, trigger) {
	const bet = Number(params.bet ?? params.value ?? 0);
	if (!bet || state.player.money.perutah < bet) return trigger.sendToast('NO GELT!', 'error');
	state.player.money.perutah -= bet;
	let pot = (state.dreidelPot || 0) + bet;
	const roll = Math.random();
	let letter = 'נ';
	let outcome = 'Nun. Nothing.';
	if (roll >= 0.25 && roll < 0.5) { letter = 'ג'; outcome = `GIMMEL! WIN POT! (+${pot})`; state.player.money.perutah += pot; pot = 0; }
	else if (roll >= 0.5 && roll < 0.75) { letter = 'ה'; const half = Math.floor(pot / 2); outcome = 'Hei. Half Pot.'; state.player.money.perutah += half; pot -= half; }
	else if (roll >= 0.75) { letter = 'ש'; outcome = 'Shin. Put 10.'; if (state.player.money.perutah >= 10) { state.player.money.perutah -= 10; pot += 10; } }
	state.dreidelPot = pot;
	callbacks.onUIUpdate({ screen: 'dreidel-screen', dreidel: { pot, playerMoney: state.player.money.perutah, lastResult: { letter, outcome } } });
}

export function handleEconomyAction(state, action, params, callbacks, trigger) {
	if (action === 'swap_otzar' || action === 'swapOtzar') swapOtzar(state, params, callbacks, trigger);
	else if (action === 'craftAction') {
		Crafting.craftItem(state, params.recipeId, (message, type) => trigger.sendToast(message, type));
		state.stats.itemsCrafted += 1;
		checkMitzvahs(state, (message, type) => trigger.sendToast(message, type));
		callbacks.onUIUpdate({ screen: 'crafting-screen', crafting: Crafting.getCraftingPayload(state) });
	} else if (action === 'gemachAction') {
		if (params.type === 'deposit') trigger.gemach_deposit(Number(params.amount));
		if (params.type === 'withdraw') trigger.gemach_withdraw(Number(params.amount));
		callbacks.onUIUpdate({ screen: 'gemach-screen', gemach: { playerMoney: state.player.money.perutah || 0, balance: state.player.gemachBalance || 0 } });
	} else if (action === 'toggleGate') {
		const gateId = params.gateId || params.value;
		state.activeGates ||= {};
		state.activeGates[gateId] = !state.activeGates[gateId];
		callbacks.onUIUpdate({ screen: 'gates-screen', gates: getGatesPayload(state) });
	} else if (action === 'unlockGate37') {
		const gate = gates37.find(candidate => candidate.id === (params.id || params.value));
		if (!gate || state.player.wisdomPoints < gate.cost || state.player.unlockedGates37.includes(gate.id)) return trigger.sendToast('Cannot unlock.', 'error');
		state.player.wisdomPoints -= gate.cost; state.player.unlockedGates37.push(gate.id);
		trigger.sendToast(`Unlocked Gate of ${gate.name}!`, 'success');
		callbacks.onUIUpdate({ screen: 'gates37-screen', gates37: getGates37Payload(state) });
	} else if (action === 'spinDreidel') spinDreidel(state, params, callbacks, trigger);
	else if (action === 'useOverworldItem' || action === 'use_item') trigger.useItemOverworld(params.itemId || params.id || params.value);
	else return false;
	return true;
}
