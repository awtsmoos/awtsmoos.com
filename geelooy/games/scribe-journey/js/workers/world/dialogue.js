// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../quests.js';
import * as Shop from '../shop.js';
import { applyChoiceAction } from './dialogueChoices.js';
import { applyDialogueEffect, conditionPassed } from './dialogueEffects.js';

function entityId(entity = {}) {
	return entity.id || entity.npcId || entity.questGiver || null;
}

function endDialogue(state, sendUIUpdate) {
	state.dialogue.active = false;
	state.mode = 'game';
	sendUIUpdate({ dialogue: { active: false } });
}

function selectQuestBranch(state, entity, requestedBranch) {
	if (!entity.questGiver) return requestedBranch;
	const status = Quests.getStatus(state, entity.questGiver);
	if (status === 'finished') return entity.dialogue.completed ? 'completed' : requestedBranch;
	if (status === 'ready') return entity.dialogue.ready ? 'ready' : 'in_progress';
	if (status === 'in_progress') return 'in_progress';
	return requestedBranch;
}

/** Opens one conversation and records that the named resident was reached. */
export function startDialogue(state, entity, branch, sendUIUpdate) {
	state.mode = 'dialogue';
	state.dialogue = {
		active: true,
		entity,
		branch: selectQuestBranch(state, entity, branch),
		index: 0,
		choices: []
	};
	const npcId = entityId(entity);
	if (npcId) {
		Quests.emit(state, { type: 'speak_npc', targetId: npcId, mapId: state.currentMapId });
		Quests.emit(state, { type: 'return_npc', targetId: npcId, mapId: state.currentMapId });
	}
	advanceDialogue(state, sendUIUpdate);
}

function showMessage(state, message, sendUIUpdate) {
	state.dialogue.currentText = message;
	state.dialogue.index += 1;
	sendUIUpdate({ dialogue: { active: true, text: message } });
}

function handleLogicMessage(state, message, sendUIUpdate, trigger) {
	if (message.condition && !conditionPassed(state, message.condition)) {
		const text = message.fail?.[0] || 'That condition has not yet been met.';
		sendUIUpdate({ dialogue: { active: true, text } });
		return true;
	}
	if (message.choices) {
		state.dialogue.choices = message.choices;
		sendUIUpdate({ dialogue: { active: true, text: message.text || state.dialogue.currentText, choices: message.choices } });
		return true;
	}
	const shouldEnd = applyDialogueEffect(state, message, trigger);
	state.dialogue.index += 1;
	if (shouldEnd) endDialogue(state, sendUIUpdate);
	return shouldEnd;
}

export function advanceDialogue(state, sendUIUpdate, trigger = {}) {
	if (!state.dialogue.active) return;
	const branch = state.dialogue.entity.dialogue[state.dialogue.branch];
	if (!branch || state.dialogue.index >= branch.length) {
		endDialogue(state, sendUIUpdate);
		return;
	}
	const message = branch[state.dialogue.index];
	if (typeof message === 'string') {
		if (message === 'end') endDialogue(state, sendUIUpdate);
		else showMessage(state, message, sendUIUpdate);
		return;
	}
	if (!handleLogicMessage(state, message, sendUIUpdate, trigger) && state.dialogue.active) {
		advanceDialogue(state, sendUIUpdate, trigger);
	}
}

export function handleDialogueChoice(state, index, sendUIUpdate, trigger) {
	const choice = state.dialogue.choices[index];
	if (!choice) return;
	if (applyChoiceAction(state, choice, index, sendUIUpdate, trigger) === 'stop') return;
	if (state.dialogue.entity.shop) {
		Shop.handleShopChoice(state, choice, sendUIUpdate);
		return;
	}
	if (choice.next) {
		state.dialogue.branch = choice.next;
		state.dialogue.index = 0;
		advanceDialogue(state, sendUIUpdate, trigger);
	} else {
		endDialogue(state, sendUIUpdate);
	}
}
