// B"H
// Boruch Hashem
// Blessed is He

import { formatMoney } from '../data/database.js';
import { emitQuestEvent, invalidateQuestEventIndex } from './systems/quests/questEvents.js';
import { buildQuestLogPayload } from './systems/quests/questPresentation.js';
import { grantQuestRewards } from './systems/quests/questRewards.js';
import {
	acceptQuest, availableQuestIds, completeQuestState, ensureQuestState,
	findActiveQuest, getQuestStatus, trackQuest as selectTrackedQuest
} from './systems/quests/questState.js';

function toast(sendToast, message, type) {
	if (typeof sendToast === 'function') sendToast(message, type);
}

export function accept(state, questId, sendToast = null) {
	const quest = acceptQuest(state, questId);
	if (!quest) return false;
	invalidateQuestEventIndex(state);
	toast(sendToast, `New Task: ${quest.title}`, 'info');
	return true;
}

export function updateObjective(state, event, sendToast = null) {
	ensureQuestState(state.player);
	return emitQuestEvent(state, event, sendToast).length > 0;
}

export const emit = updateObjective;

/** Turns in one ready thread, rewards it once, and tells dependent quests. */
export function finalize(state, questId, sendToast = null) {
	const quest = findActiveQuest(state, questId);
	if (!quest || !['ready', 'completed'].includes(quest.status)) return false;
	const rewardResult = grantQuestRewards(state, quest);
	completeQuestState(state, questId);
	invalidateQuestEventIndex(state);
	emitQuestEvent(state, { type: 'complete_other_quest', targetId: questId, quantity: 1 }, sendToast);
	for (const event of rewardResult.itemEvents) emitQuestEvent(state, event, sendToast);
	toast(sendToast, `Task Complete: ${quest.title}!`, 'success');
	return true;
}

export function giveItem(state, itemId, quantity = 1, sendToast = null) {
	const definition = state.db.items[itemId];
	if (!definition) {
		console.warn(`Item ${itemId} not found in DB.`);
		return false;
	}
	const count = Math.max(1, Number(quantity) || 1);
	for (let index = 0; index < count; index += 1) state.player.inventory.push({ ...definition });
	toast(sendToast, `Acquired: ${definition.name}${count > 1 ? ` x${count}` : ''}`, 'success');
	emitQuestEvent(state, { type: 'collect_item', targetId: itemId, quantity: count, mapId: state.currentMapId }, sendToast);
	return true;
}

export function getStatus(state, questId) {
	return getQuestStatus(state, questId);
}

export function getObjectiveStatus(state, questId, objectiveId) {
	const objective = findActiveQuest(state, questId)?.objectives.find(entry => entry.id === objectiveId);
	return Boolean(objective?.completed);
}

export function getAvailableQuestIds(state) {
	return availableQuestIds(state);
}

export function trackQuest(state, questId) {
	return selectTrackedQuest(state, questId);
}

export function getInventoryPayload(state) {
	return { items: state.player.inventory, money: formatMoney(state.player.money) };
}

export function getQuestLogPayload(state) {
	ensureQuestState(state.player);
	return buildQuestLogPayload(state);
}
