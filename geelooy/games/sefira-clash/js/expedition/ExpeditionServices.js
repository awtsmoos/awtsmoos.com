//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen service law gives dialogue an idempotent world consequence. The Awtsmoos
 * renews giver and traveler together; Awtsmoos.com activates lawful quests or grants
 * one measured civic blessing without turning conversation into repeatable farming.
 */

import { expeditionCitizen } from '../data/expedition/npcCatalog.js';
import { expeditionLocation } from '../data/expedition/locationCatalog.js';
import { expeditionLevelFromXp } from './ExpeditionDefaults.js';
import { activateExpeditionQuest } from './ExpeditionQuestLedger.js';

export function useExpeditionCitizenService(profile, citizenId) {
	const citizen = expeditionCitizen(citizenId);
	if (!citizen || !profile.discovered.includes(citizen.locationId)) {
		return result(false, profile, 'CITIZEN_UNAVAILABLE', null);
	}
	if (citizen.service === 'quests') {
		const activation = activateExpeditionQuest(profile, citizen.questId);
		return result(
			activation.changed,
			activation.profile,
			activation.changed ? null : 'QUEST_UNAVAILABLE',
			citizen
		);
	}
	if (['shop', 'craft'].includes(citizen.service)) {
		return result(true, profile, null, citizen);
	}
	if (profile.serviceClaims.includes(citizen.id)) {
		return result(false, profile, 'SERVICE_ALREADY_CLAIMED', citizen);
	}
	const location = expeditionLocation(citizen.locationId);
	const reward =
		citizen.service === 'heal' ? { xp: 20, reputation: 2 } : { xp: 30, reputation: 1 };
	const xp = profile.xp + reward.xp;
	const next = {
		...profile,
		xp,
		level: expeditionLevelFromXp(xp),
		serviceClaims: [...new Set([...profile.serviceClaims, citizen.id])],
		reputation: {
			...profile.reputation,
			[location.regionId]:
				Number(profile.reputation[location.regionId] || 0) + reward.reputation
		}
	};
	return result(true, next, null, citizen, reward);
}

function result(changed, profile, reason, citizen, reward = null) {
	return { changed, profile, reason, citizen, reward };
}
