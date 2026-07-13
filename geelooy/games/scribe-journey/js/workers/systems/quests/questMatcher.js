// B"H
// Boruch Hashem
// Blessed is He

import { canonicalObjectiveType } from './questDefinition.js';

function eventTargetId(event = {}) {
	return event.targetId ?? event.itemId ?? event.musagId ?? event.speciesId ??
		event.factionId ?? event.flag ?? event.npcId ?? event.landmarkId ??
		event.recipeId ?? event.bossId ?? event.objectId ?? event.mapId;
}

export function normalizeQuestEvent(event = {}) {
	return {
		...event,
		type: canonicalObjectiveType(event.type || 'manual'),
		targetId: eventTargetId(event),
		quantity: Math.max(0, Number(event.quantity ?? event.count ?? 1) || 0)
	};
}

export function objectiveMatches(objective, event) {
	if (event.questId && event.questId !== objective.questId) return false;
	if (event.objectiveId && event.objectiveId !== objective.id) return false;
	if (objective.type !== event.type && !event.objectiveId) return false;
	if (objective.targetId !== undefined && objective.targetId !== null) {
		if (String(objective.targetId) !== String(event.targetId)) return false;
	}
	if (objective.mapIds?.length) {
		if (!event.mapId || !objective.mapIds.includes(event.mapId)) return false;
	}
	return true;
}

export function applyObjectiveEvent(objective, event) {
	if (objective.completed || !objectiveMatches(objective, event)) return false;
	objective.current = Math.min(objective.required, objective.current + event.quantity);
	objective.completed = objective.current >= objective.required;
	return true;
}
