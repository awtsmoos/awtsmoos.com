// B"H
// Boruch Hashem
// Blessed is He

import { normalizeQuestDefinition } from './questDefinition.js';

export function ensureQuestState(player = {}) {
	for (const field of ['activeQuests', 'completedQuests', 'rewardedQuests', 'unlockedRecipes']) {
		player[field] = Array.isArray(player[field]) ? player[field] : [];
	}
	for (const field of ['questChoices', 'reputation', 'worldChanges']) {
		player[field] = player[field] && typeof player[field] === 'object' ? player[field] : {};
	}
	player.trackedQuestId = typeof player.trackedQuestId === 'string' ? player.trackedQuestId : null;
	return player;
}

export function findActiveQuest(state, questId) {
	ensureQuestState(state.player);
	return state.player.activeQuests.find(quest => quest.id === questId) || null;
}

export function prerequisitesMet(state, definition = {}) {
	ensureQuestState(state.player);
	const prerequisites = Array.isArray(definition.prerequisites) ? definition.prerequisites : [];
	return prerequisites.every(questId => state.player.completedQuests.includes(questId));
}

export function canAcceptQuest(state, questId) {
	ensureQuestState(state.player);
	const definition = state.db?.quests?.[questId];
	if (!definition || findActiveQuest(state, questId)) return false;
	if (state.player.completedQuests.includes(questId)) return false;
	if (!prerequisitesMet(state, definition)) return false;
	const requiredLevel = Number(definition.level || 0);
	return Number(state.player.level || 1) >= requiredLevel;
}

export function acceptQuest(state, questId) {
	if (!canAcceptQuest(state, questId)) return null;
	const quest = normalizeQuestDefinition(state.db.quests[questId]);
	state.player.activeQuests.push(quest);
	if (!state.player.trackedQuestId) state.player.trackedQuestId = quest.id;
	return quest;
}

export function markQuestReady(quest) {
	if (quest.objectives.every(objective => objective.completed)) {
		quest.status = 'ready';
		return true;
	}
	return false;
}

export function completeQuestState(state, questId) {
	ensureQuestState(state.player);
	state.player.activeQuests = state.player.activeQuests.filter(quest => quest.id !== questId);
	if (!state.player.completedQuests.includes(questId)) state.player.completedQuests.push(questId);
	if (state.player.trackedQuestId === questId) {
		state.player.trackedQuestId = state.player.activeQuests[0]?.id || null;
	}
}

export function getQuestStatus(state, questId) {
	ensureQuestState(state.player);
	if (state.player.completedQuests.includes(questId)) return 'finished';
	const active = findActiveQuest(state, questId);
	if (active) return active.status;
	return canAcceptQuest(state, questId) ? 'available' : 'locked';
}

export function availableQuestIds(state) {
	return Object.keys(state.db?.quests || {}).filter(questId => canAcceptQuest(state, questId));
}

export function trackQuest(state, questId) {
	if (!findActiveQuest(state, questId)) return false;
	state.player.trackedQuestId = questId;
	return true;
}
