//B"H
//Boruch Hashem
//Blessed is He

/**
 * Service actions bind current profile truth to shlichus, market, trainer, citizen, and
 * expanded civic rooms. The Awtsmoos renews each choice; Awtsmoos.com validates again at
 * click-time, persists once, and emits explicit mission evidence instead of view mutation.
 */

import { useOpenWorldCivicService } from './OpenWorldCivicService.js';
import { speakToWorldCitizen } from './OpenWorldCitizenService.js';
import { activateOpenWorldMission, claimOpenWorldMission } from './OpenWorldMissionLedger.js';
import { purchaseOpenWorldProvision } from './OpenWorldMerchant.js';
import { pushOpenWorldDomainEvent } from './OpenWorldState.js';
import { trainOpenWorldTechnique } from './OpenWorldTrainer.js';

export function activateWorldMission(expedition, state, missionId) {
	const result = activateOpenWorldMission(
		expedition.profile,
		missionId,
		state.openWorld.locationId
	);
	return persistResult(expedition, result, result.changed);
}

export function claimWorldMission(expedition, state, missionId) {
	const result = claimOpenWorldMission(expedition.profile, missionId, state.openWorld.regionId);
	return persistResult(expedition, result, result.claimed);
}

export function purchaseWorldProvision(expedition, state, offerId) {
	const result = purchaseOpenWorldProvision(
		expedition.profile,
		offerId,
		state.openWorld.locationId
	);
	return persistEventResult(expedition, state, result, result.purchased);
}

export function trainWorldTechnique(expedition, state, family) {
	const result = trainOpenWorldTechnique(
		expedition.profile,
		family,
		state.openWorld.regionId,
		state.openWorld.locationId
	);
	if (result.trained) state.openWorld.techniqueRanks[family] = result.lesson.rank;
	return persistEventResult(expedition, state, result, result.trained);
}

export function speakWorldCitizen(expedition, state, citizenId) {
	const result = speakToWorldCitizen(expedition, state, citizenId);
	if (result.spoken) pushOpenWorldDomainEvent(state, result.event);
	return result;
}

export function useWorldCivicService(expedition, state, service) {
	const result = useOpenWorldCivicService(expedition.profile, state, service);
	return persistEventResult(expedition, state, result, result.used);
}

export function restInWorldHideout(expedition, state) {
	state.openWorld.combat.stamina = 100;
	state.openWorld.combat.focus = 100;
	const profile = {
		...expedition.profile,
		openWorld: {
			...expedition.profile.openWorld,
			rests: expedition.profile.openWorld.rests + 1
		}
	};
	expedition.replaceProfile(profile);
	pushOpenWorldDomainEvent(state, { type: 'rest', targetId: 'hideout', count: 1 });
	return { rested: true, profile };
}

function persistResult(expedition, result, changed) {
	if (changed) expedition.replaceProfile(result.profile);
	return result;
}

function persistEventResult(expedition, state, result, changed) {
	if (!changed) return result;
	expedition.replaceProfile(result.profile);
	pushOpenWorldDomainEvent(state, result.event);
	return result;
}
