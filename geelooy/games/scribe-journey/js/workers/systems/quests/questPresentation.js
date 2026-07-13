// B"H
// Boruch Hashem
// Blessed is He

import { availableQuestIds } from './questState.js';
import { buildReputationPayload } from './reputationPresentation.js';

function objectivePayload(objective) {
	return {
		id: objective.id,
		type: objective.type,
		targetId: objective.targetId,
		text: objective.text,
		displayText: `${objective.text} (${objective.current}/${objective.required})`,
		current: objective.current,
		required: objective.required,
		completed: objective.completed,
		mapIds: objective.mapIds || []
	};
}

function activeQuestPayload(quest, trackedQuestId) {
	const objectives = (quest.objectives || []).map(objectivePayload);
	const nextObjective = objectives.find(objective => !objective.completed);
	return {
		id: quest.id,
		title: quest.title || quest.name,
		name: quest.name || quest.title,
		summary: quest.summary || quest.desc || '',
		description: quest.summary || quest.desc || '',
		category: quest.category || 'side',
		regionId: quest.regionId || null,
		status: quest.status,
		tracked: quest.id === trackedQuestId,
		ready: quest.status === 'ready',
		nextMapId: nextObjective?.mapIds?.[0] || null,
		objectives
	};
}

function availableQuestPayload(state, questId) {
	const quest = state.db.quests[questId];
	return {
		id: quest.id,
		title: quest.title || quest.name,
		summary: quest.summary || quest.desc || '',
		category: quest.category || 'side',
		regionId: quest.regionId || null,
		level: quest.level || 1
	};
}

function restorationPayload(player) {
	return Object.entries(player.mapChanges || {}).flatMap(([mapId, changes]) =>
		Object.keys(changes || {})
			.filter(changeId => changes[changeId])
			.map(changeId => ({ mapId, changeId }))
	);
}

function authoredQuestId(questId) {
	return questId.startsWith('campaign_') ||
		questId.startsWith('side_') ||
		questId.startsWith('postgame_');
}

/** Presents authored work, standing, and the permanent places already repaired. */
export function buildQuestLogPayload(state) {
	const trackedQuestId = state.player.trackedQuestId || null;
	const quests = (state.player.activeQuests || []).map(quest =>
		activeQuestPayload(quest, trackedQuestId)
	);
	const groups = {};
	for (const quest of quests) {
		groups[quest.category] ||= [];
		groups[quest.category].push(quest);
	}
	const availableIds = availableQuestIds(state).filter(authoredQuestId);
	return {
		quests,
		groups,
		available: availableIds.map(questId => availableQuestPayload(state, questId)),
		restorations: restorationPayload(state.player),
		reputation: buildReputationPayload(state.player),
		trackedQuestId,
		completedQuestIds: [...(state.player.completedQuests || [])]
	};
}
