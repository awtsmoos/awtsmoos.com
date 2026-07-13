// B"H
// Boruch Hashem
// Blessed is He

import { applyObjectiveEvent, normalizeQuestEvent } from './questMatcher.js';
import { markQuestReady } from './questState.js';

const STATE_INDEX = new WeakMap();

function activeSignature(state) {
	return (state.player.activeQuests || []).map(quest => quest.id).join('|');
}

function buildIndex(state) {
	const listeners = new Map();
	for (const quest of state.player.activeQuests || []) {
		for (const objective of quest.objectives || []) {
			objective.questId = quest.id;
			if (!listeners.has(objective.type)) listeners.set(objective.type, []);
			listeners.get(objective.type).push({ quest, objective });
		}
	}
	return { signature: activeSignature(state), listeners };
}

function indexFor(state) {
	const signature = activeSignature(state);
	const cached = STATE_INDEX.get(state);
	if (cached?.signature === signature) return cached;
	const next = buildIndex(state);
	STATE_INDEX.set(state, next);
	return next;
}

/** Emits one standardized fact and touches only objectives listening for it. */
export function emitQuestEvent(state, rawEvent, sendToast = null) {
	const event = normalizeQuestEvent(rawEvent);
	const listeners = indexFor(state).listeners.get(event.type) || [];
	const updates = [];
	for (const { quest, objective } of listeners) {
		const wasComplete = objective.completed;
		if (!applyObjectiveEvent(objective, event)) continue;
		updates.push({ questId: quest.id, objectiveId: objective.id, current: objective.current });
		if (!wasComplete && objective.completed && sendToast) {
			sendToast(`Objective Complete: ${objective.text}`, 'success');
		}
		if (markQuestReady(quest) && sendToast) {
			sendToast(`Task Ready to Turn In: ${quest.title}`, 'info');
		}
	}
	return updates;
}

export function invalidateQuestEventIndex(state) {
	STATE_INDEX.delete(state);
}
