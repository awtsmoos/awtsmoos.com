// B"H
// Boruch Hashem
// Blessed is He

import { emitQuestEvent } from './questEvents.js';

const STARTERS = new Set(['alephling', 'golemet', 'neginah']);

export function chooseScribeName(state, proposedName, sendToast = null) {
	const name = String(proposedName || '').trim().slice(0, 24);
	if (!name) return false;
	state.player.name = name;
	state.player.questChoices.player_name_chosen = name;
	emitQuestEvent(state, {
		type: 'dialogue_choice',
		targetId: 'player_name_chosen',
		quantity: 1
	}, sendToast);
	if (sendToast) sendToast(`The Chronicle remembers ${name}.`, 'success');
	return true;
}

function removeSelectedStarter(player, starterId) {
	player.team = player.team.filter(member => member.id !== starterId);
	player.storage = player.storage.filter(member => member.id !== starterId);
}

function movePreviousLeadToStorage(player, previousLead, starterId) {
	if (!previousLead || previousLead.id === starterId) return;
	player.team = player.team.filter(member => member !== previousLead);
	if (!player.storage.some(member => member.id === previousLead.id)) {
		player.storage.push(previousLead);
	}
}

/** Places one chosen living letter first without consuming or duplicating it. */
export function chooseStarter(state, starterId, sendToast = null) {
	if (!STARTERS.has(starterId) || !state.db.musagim[starterId]) return false;
	const previousLead = state.player.team[0] || null;
	removeSelectedStarter(state.player, starterId);
	movePreviousLeadToStorage(state.player, previousLead, starterId);
	state.player.team.unshift({ id: starterId, level: 5 });
	state.player.team = state.player.team.slice(0, 6);
	state.player.questChoices.starter_musag = starterId;
	emitQuestEvent(state, {
		type: 'recruit_musag',
		targetId: 'starter_musag',
		selectedId: starterId,
		quantity: 1
	}, sendToast);
	emitQuestEvent(state, {
		type: 'party_composition',
		targetId: 'starter_equipped',
		quantity: 1
	}, sendToast);
	if (sendToast) {
		sendToast(`${state.db.musagim[starterId].name} joins the Chronicle.`, 'success');
	}
	return true;
}
