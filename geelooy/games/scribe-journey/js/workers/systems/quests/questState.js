// B"H
// Boruch Hashem
// Blessed is He

import { normalizeQuestDefinition } from './questDefinition.js';
import {
	prerequisitesAreMet,
	questIsEligible
} from './questEligibility.js';

/**
 * @file Owns quest acceptance, tracking, readiness, and completion state.
 * @description The Awtsmoos renews possibility and actuality without confusing
 * them. This gate lets Awtsmoos.com preserve future authored threads while only
 * allowing verified playable vessels to enter a living Chronicle.
 */

export function ensureQuestState(player = {}) {
	for (const field of ['activeQuests', 'completedQuests', 'rewardedQuests', 'unlockedRecipes']) {
		player[field] = Array.isArray(player[field]) ? player[field] : [];
	}

	for (const field of ['questChoices', 'reputation', 'worldChanges']) {
		player[field] = player[field] && typeof player[field] === 'object'
			? player[field]
			: {};
	}

	player.trackedQuestId = typeof player.trackedQuestId === 'string'
		? player.trackedQuestId
		: null;
	return player;
}

export function findActiveQuest(state, questId) {
	ensureQuestState(state.player);
	return state.player.activeQuests.find((quest) => quest.id === questId) || null;
}

export function prerequisitesMet(state, definition = {}) {
	ensureQuestState(state.player);
	return prerequisitesAreMet(state.player.completedQuests, definition);
}

export function canAcceptQuest(state, questId) {
	ensureQuestState(state.player);
	const definition = state.db?.quests?.[questId];
	return questIsEligible({
		definition,
		completedQuestIds: state.player.completedQuests,
		hasActiveQuest: Boolean(findActiveQuest(state, questId)),
		hasCompletedQuest: state.player.completedQuests.includes(questId),
		playerLevel: state.player.level
	});
}

export function acceptQuest(state, questId) {
	if (!canAcceptQuest(state, questId)) {
		return null;
	}

	const quest = normalizeQuestDefinition(state.db.quests[questId]);
	state.player.activeQuests.push(quest);

	if (!state.player.trackedQuestId) {
		state.player.trackedQuestId = quest.id;
	}

	return quest;
}

export function markQuestReady(quest) {
	if (!quest.objectives.every((objective) => objective.completed)) {
		return false;
	}

	quest.status = 'ready';
	return true;
}

export function completeQuestState(state, questId) {
	ensureQuestState(state.player);
	state.player.activeQuests = state.player.activeQuests.filter((quest) => quest.id !== questId);

	if (!state.player.completedQuests.includes(questId)) {
		state.player.completedQuests.push(questId);
	}

	if (state.player.trackedQuestId === questId) {
		state.player.trackedQuestId = state.player.activeQuests[0]?.id || null;
	}
}

export function getQuestStatus(state, questId) {
	ensureQuestState(state.player);

	if (state.player.completedQuests.includes(questId)) {
		return 'finished';
	}

	const active = findActiveQuest(state, questId);
	if (active) {
		return active.status;
	}

	return canAcceptQuest(state, questId) ? 'available' : 'locked';
}

export function availableQuestIds(state) {
	return Object.keys(state.db?.quests || {}).filter((questId) => canAcceptQuest(state, questId));
}

export function trackQuest(state, questId) {
	if (!findActiveQuest(state, questId)) {
		return false;
	}

	state.player.trackedQuestId = questId;
	return true;
}
