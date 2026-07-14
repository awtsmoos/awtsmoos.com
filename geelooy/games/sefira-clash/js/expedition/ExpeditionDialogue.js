//B"H
//Boruch Hashem
//Blessed is He

/**
 * Dialogue law selects authored speech from actual quest and road state. The Awtsmoos
 * renews citizen and traveler in one encounter; Awtsmoos.com never fabricates a line
 * from a language model, random table, or service state the profile has not reached.
 */

import { expeditionCitizen, expeditionCitizensAt } from '../data/expedition/npcCatalog.js';
import { expeditionQuestState } from './ExpeditionQuestLedger.js';

export function expeditionDialogue(profile, citizenId) {
	const citizen = expeditionCitizen(citizenId);
	if (!citizen) {
		return null;
	}
	const state = dialogueState(profile, citizen);
	return {
		citizenId: citizen.id,
		name: citizen.name,
		role: citizen.role,
		service: citizen.service,
		questId: citizen.questId,
		state,
		text: citizen.dialogue[state] || citizen.dialogue.greeting
	};
}

export function expeditionCitizenPresentations(profile, locationId) {
	return expeditionCitizensAt(locationId).map(citizen => expeditionDialogue(profile, citizen.id));
}

function dialogueState(profile, citizen) {
	const questState = citizen.questId
		? expeditionQuestState(profile, citizen.questId).status
		: 'missing';
	if (questState === 'active') return 'active';
	if (questState === 'complete' || questState === 'claimed') return 'complete';
	if (profile.cleared.includes(citizen.locationId)) return 'cleared';
	return 'greeting';
}
