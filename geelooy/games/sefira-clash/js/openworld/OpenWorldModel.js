//B"H
//Boruch Hashem
//Blessed is He

/**
 * The open-world facade binds Expedition persistence to physical city scenes, citizens,
 * and civic services. The Awtsmoos renews map, traveler, mission, and memory; Awtsmoos.com
 * keeps one profile authority while focused modules own state creation and service law.
 */

import { EXPEDITION_LOCATIONS, expeditionLocation } from '../data/expedition/locationCatalog.js';
import {
	applyOpenWorldDomainEvents,
	rememberOpenWorldStreetPosition
} from './OpenWorldPersistence.js';
import {
	activateWorldMission,
	claimWorldMission,
	purchaseWorldProvision,
	restInWorldHideout,
	speakWorldCitizen,
	trainWorldTechnique,
	useWorldCivicService
} from './OpenWorldServiceActions.js';
import { createOpenWorldServiceSnapshot } from './OpenWorldServiceSnapshot.js';
import { createOpenWorldGameState } from './OpenWorldStateFactory.js';

export class OpenWorldModel {
	constructor(expeditionModel) {
		this.expedition = expeditionModel;
	}

	createState(character, cosmetic) {
		return createOpenWorldGameState(
			this.expedition,
			this.activeSettlement(),
			character,
			cosmetic
		);
	}

	consumeState(state) {
		const events = state.openWorld.domainEvents.splice(0);
		let profile = this.expedition.profile;
		if (events.length) profile = applyOpenWorldDomainEvents(profile, events).profile;
		if (state.frame % 30 === 0) profile = rememberOpenWorldStreetPosition(profile, state);
		if (profile !== this.expedition.profile) this.expedition.replaceProfile(profile);
		return this.snapshot(state);
	}

	snapshot(state) {
		return createOpenWorldServiceSnapshot(this.expedition.profile, state);
	}

	activateMission(state, missionId) {
		return activateWorldMission(this.expedition, state, missionId);
	}

	claimMission(state, missionId) {
		return claimWorldMission(this.expedition, state, missionId);
	}

	purchase(state, offerId) {
		return purchaseWorldProvision(this.expedition, state, offerId);
	}

	train(state, family) {
		return trainWorldTechnique(this.expedition, state, family);
	}

	speak(state, citizenId) {
		return speakWorldCitizen(this.expedition, state, citizenId);
	}

	useCivicService(state, service) {
		return useWorldCivicService(this.expedition, state, service);
	}

	rest(state) {
		return restInWorldHideout(this.expedition, state);
	}

	activeSettlement() {
		const profile = this.expedition.profile;
		const active = expeditionLocation(profile.activeLocationId);
		if (isAvailableSettlement(active, profile)) return active;
		return (
			EXPEDITION_LOCATIONS.find(location => {
				return isAvailableSettlement(location, profile);
			}) || EXPEDITION_LOCATIONS[0]
		);
	}
}

function isAvailableSettlement(location, profile) {
	return location?.kind === 'settlement' && profile.discovered.includes(location.id);
}
