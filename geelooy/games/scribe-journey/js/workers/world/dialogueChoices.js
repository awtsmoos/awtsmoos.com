// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../quests.js';

function spend(state, amount, sendUIUpdate) {
	if ((state.player.money.perutah || 0) < amount) {
		sendUIUpdate({ dialogue: { active: true, text: `You need ${amount} Perutahs.` } });
		return false;
	}
	state.player.money.perutah -= amount;
	return true;
}

function charityEvent(state, amount, targetId, trigger) {
	state.stats.tzedakahCount = (state.stats.tzedakahCount || 0) + 1;
	Quests.emit(state, { type: 'donate_money', targetId, quantity: amount, mapId: state.currentMapId }, trigger.sendToast);
}

/** Handles legacy choice actions while recording the selected relationship. */
export function applyChoiceAction(state, choice, index, sendUIUpdate, trigger) {
	const entity = state.dialogue.entity || {};
	const targetId = choice.questFlag || choice.id || choice.action || `${entity.id || entity.questGiver || 'dialogue'}_${index}`;
	Quests.emit(state, { type: 'dialogue_choice', targetId, quantity: 1, mapId: state.currentMapId }, trigger.sendToast);
	state.player.questChoices[targetId] = true;

	if (choice.action === 'ride_ohel') {
		if (!spend(state, 50, sendUIUpdate)) return 'stop';
		state.dialogue.branch = 'ride_ohel';
		state.dialogue.index = 0;
		return 'continue';
	}
	if (choice.action === 'give_tzedakah_18') {
		if (!spend(state, 18, sendUIUpdate)) return 'stop';
		charityEvent(state, 18, 'given_tzedakah_3', trigger);
		return 'continue';
	}
	if (choice.action === 'give_charity') {
		if (!spend(state, 500, sendUIUpdate)) return 'stop';
		charityEvent(state, 500, 'give_charity', trigger);
		state.dialogue.branch = 'give_charity';
		state.dialogue.index = 0;
		return 'continue';
	}
	if (choice.action === 'gemach_deposit') {
		trigger.gemach_deposit(choice.amount);
		sendUIUpdate({ dialogue: { active: true, text: `Deposited ${Math.abs(choice.amount)}. May it bear fruit.` } });
		return 'stop';
	}
	if (choice.action === 'gemach_withdraw') {
		trigger.gemach_withdraw(choice.amount);
		sendUIUpdate({ dialogue: { active: true, text: `Withdrew ${choice.amount}. Use it for Mitzvot.` } });
		return 'stop';
	}
	return 'continue';
}
