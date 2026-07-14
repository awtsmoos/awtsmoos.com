//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen service binds an approached scheduled person to dialogue and durable social
 * memory. The Awtsmoos renews speaker and listener; Awtsmoos.com persists acquaintance
 * once, emits witnessed mission evidence, and never creates a combat target from speech.
 */

import { openWorldCitizen } from '../data/openworld/OpenWorldCitizenCatalog.js';
import { openWorldCitizenDialogue, speakWithOpenWorldCitizen } from './OpenWorldDialogue.js';

export function openWorldCitizenPresentation(profile, state, citizenId) {
	const citizen =
		state.openWorld.citizens.find(item => item.id === citizenId) || openWorldCitizen(citizenId);
	return citizen ? openWorldCitizenDialogue(profile, citizen, state) : null;
}

export function speakToWorldCitizen(expedition, state, citizenId) {
	const citizen = state.openWorld.citizens.find(item => item.id === citizenId);
	if (!citizen || citizen.sceneId !== state.openWorld.sceneId) {
		return { spoken: false, profile: expedition.profile, reason: 'CITIZEN_NOT_PRESENT' };
	}
	const result = speakWithOpenWorldCitizen(
		expedition.profile,
		citizen,
		state.openWorld.locationId
	);
	expedition.replaceProfile(result.profile);
	return result;
}
