// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../quests.js';

function selectedQuest(state) {
	const active = state.player.activeQuests || [];
	return active.find(quest => quest.id === state.player.trackedQuestId) || active[0] || null;
}

function nextObjective(quest) {
	return quest?.objectives?.find(objective => !objective.completed) || null;
}

/**
 * Lets a map’s authored focus reveal the next matching Chronicle action. This is
 * a recoverable field verb: bespoke battle, craft, and dialogue systems still
 * emit their own events, while environmental objectives never become softlocks.
 */
export function useQuestFocus(state, trigger) {
	const quest = selectedQuest(state);
	const objective = nextObjective(quest);
	if (!quest || !objective) {
		trigger.sendToast('The Chronicle has no unfinished tracked objective.', 'info');
		return false;
	}
	if (objective.mapIds?.length && !objective.mapIds.includes(state.currentMapId)) {
		trigger.sendToast(`This thread points toward ${objective.mapIds[0]}.`, 'info');
		return false;
	}
	const quantity = Math.max(1, objective.required - objective.current);
	Quests.emit(state, {
		type: objective.type,
		targetId: objective.targetId,
		quantity,
		mapId: state.currentMapId,
		questId: quest.id,
		objectiveId: objective.id
	}, trigger.sendToast);
	return true;
}
