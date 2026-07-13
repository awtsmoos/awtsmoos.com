// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../../quests.js';

/**
 * @file Protects one-use world deeds from being spent before their quest exists.
 * @description The Awtsmoos renews opportunity and intention together; a reed,
 * clue, fragment, or wheel should not vanish before its relationship can be
 * remembered. Awtsmoos.com is recalled as a world where timing belongs to
 * meaning, not only to the first click that reaches an object.
 */

function objectiveIsActive(state, requirement) {
	if (!requirement) {
		return true;
	}

	return state.player.activeQuests.some((quest) =>
		quest.objectives.some((objective) =>
			!objective.completed &&
			objective.type === requirement.type &&
			objective.targetId === requirement.targetId
		)
	);
}

/**
 * Emits an authored fact and blocks consumption when no active objective owns it.
 *
 * @param {object} state Mutable game state.
 * @param {object} entity Interacted world entity.
 * @param {object} trigger Runtime feedback bridge.
 * @returns {boolean} Whether the interaction may continue.
 */
export function authorizeEntityDeed(state, entity, trigger) {
	if (!objectiveIsActive(state, entity.requiredObjective)) {
		trigger.sendToast?.('This discovery belongs to a Chronicle thread not yet begun.', 'info');
		return false;
	}

	if (!entity.questEvent) {
		return true;
	}

	const advanced = Quests.emit(
		state,
		{ ...entity.questEvent, mapId: state.currentMapId },
		trigger.sendToast
	);

	if (!entity.consumeOnInteract || advanced) {
		return true;
	}

	trigger.sendToast?.('This clue belongs to a Chronicle thread not yet begun.', 'info');
	return false;
}
