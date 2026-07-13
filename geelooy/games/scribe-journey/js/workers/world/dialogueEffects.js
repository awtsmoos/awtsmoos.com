// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../quests.js';

export function conditionPassed(state, condition = {}) {
	if (condition.type === 'hasItem') {
		return state.player.inventory.some(item => item.id === condition.itemId);
	}
	if (condition.type === 'flags') {
		return condition.flags.every(flag => state.player.flags[flag]);
	}
	return true;
}

function runNamedAction(action, trigger = {}) {
	const actions = {
		meditate: trigger.meditate,
		meditate_ohel: trigger.meditate_ohel,
		farbrengen_heal: trigger.farbrengen_heal,
		openGemach: trigger.openGemach
	};
	const handler = actions[action];
	if (typeof handler !== 'function') return false;
	handler();
	return true;
}

function startBattle(message, trigger = {}) {
	if (!message.startBattle || typeof trigger.startBattle !== 'function') return false;
	trigger.startBattle(message.startBattle, message.context);
	return true;
}

function applyQuestEffects(state, message, trigger = {}) {
	if (message.giveItem) {
		Quests.giveItem(state, message.giveItem, message.quantity || 1, trigger.sendToast);
	}
	if (message.acceptQuest && typeof trigger.acceptQuest === 'function') {
		const questId = message.acceptQuest === true
			? state.dialogue.entity.questGiver
			: message.acceptQuest;
		trigger.acceptQuest(questId);
	}
	if (message.finalizeQuest && typeof trigger.finalizeQuest === 'function') {
		const questId = message.finalizeQuest === true
			? state.dialogue.entity.questGiver
			: message.finalizeQuest;
		trigger.finalizeQuest(questId);
	}
	if (message.updateQuest) {
		Quests.emit(state, {
			type: 'dialogue_flag',
			targetId: message.objectiveId,
			mapId: state.currentMapId
		}, trigger.sendToast);
	}
}

function applyWorldEffects(state, message, trigger = {}) {
	if (message.setFlag) state.player.flags[message.setFlag] = true;
	if (message.giveRandomItem && typeof trigger.giveRandomItem === 'function') {
		trigger.giveRandomItem(message.giveRandomItem);
	}
	if (message.read_parsha && typeof trigger.read_parsha === 'function') {
		trigger.read_parsha();
	}
	if (message.teleport && typeof trigger.teleport === 'function') {
		trigger.teleport(message.teleport);
		return true;
	}
	return false;
}

/** Applies one authored dialogue effect without assuming an action bridge exists. */
export function applyDialogueEffect(state, message, trigger = {}) {
	if (startBattle(message, trigger)) return true;
	applyQuestEffects(state, message, trigger);
	if (applyWorldEffects(state, message, trigger)) return true;
	return runNamedAction(message.action, trigger);
}
