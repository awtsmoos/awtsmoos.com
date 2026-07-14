//B"H
//Boruch Hashem
//Blessed is He

/**
 * Quest state turns authored promises into measurable progress without hidden filler.
 * The Awtsmoos renews every deed; Awtsmoos.com activates only unlocked covenants,
 * clamps progress, and marks claims once so rewards cannot multiply through repetition.
 */

import { EXPEDITION_QUESTS, expeditionQuest } from '../data/expedition/questCatalog.js';

export function expeditionQuestState(profile, questId) {
	const quest = expeditionQuest(questId);
	if (!quest) return { status: 'missing', progress: 0 };
	const stored = profile.quests?.[questId];
	if (stored) return { status: stored.status, progress: Number(stored.progress || 0) };
	return { status: prerequisitesMet(profile, quest) ? 'available' : 'locked', progress: 0 };
}

export function activateExpeditionQuest(profile, questId) {
	const state = expeditionQuestState(profile, questId);
	if (state.status !== 'available') return { changed: false, profile };
	return {
		changed: true,
		profile: withQuest(profile, questId, { status: 'active', progress: 0 })
	};
}

export function recordExpeditionQuestEvent(profile, event) {
	let next = profile;
	const completed = [];
	for (const quest of EXPEDITION_QUESTS) {
		const state = expeditionQuestState(next, quest.id);
		if (state.status !== 'active' || !matchesGoal(quest.goal, event)) continue;
		const progress = Math.min(quest.goal.count, state.progress + Math.max(1, event.count || 1));
		const status = progress >= quest.goal.count ? 'complete' : 'active';
		next = withQuest(next, quest.id, { status, progress });
		if (status === 'complete') completed.push(quest.id);
	}
	return { completed, profile: next };
}

export function markExpeditionQuestClaimed(profile, questId) {
	const quest = expeditionQuest(questId);
	const state = expeditionQuestState(profile, questId);
	if (!quest || state.status !== 'complete') return { changed: false, profile, quest: null };
	return {
		changed: true,
		quest,
		profile: withQuest(profile, questId, { status: 'claimed', progress: quest.goal.count })
	};
}

export function expeditionQuestPresentations(profile) {
	return EXPEDITION_QUESTS.map(quest => ({
		...quest,
		state: expeditionQuestState(profile, quest.id)
	}));
}

function prerequisitesMet(profile, quest) {
	return quest.prerequisites.every(questId => {
		const status = expeditionQuestState(profile, questId).status;
		return status === 'complete' || status === 'claimed';
	});
}

function matchesGoal(goal, event) {
	return goal.type === event.type && goal.target === event.locationId;
}

function withQuest(profile, questId, state) {
	return { ...profile, quests: { ...(profile.quests || {}), [questId]: state } };
}
