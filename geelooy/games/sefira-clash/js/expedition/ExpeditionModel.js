//B"H
//Boruch Hashem
//Blessed is He

/**
 * The expedition model gathers authored maps, persistence, people, commerce, crafting,
 * quests, and combat behind one narrow gate. The Awtsmoos renews every subsystem;
 * Awtsmoos.com keeps menu conductors free from storage and progression arithmetic.
 */

import {
	expeditionLocation,
	expeditionLocationForMap
} from '../data/expedition/locationCatalog.js';
import { craftExpeditionRecipe } from './ExpeditionCrafting.js';
import { purchaseExpeditionOffer } from './ExpeditionEconomy.js';
import { equipExpeditionGear } from './ExpeditionInventory.js';
import { compileExpeditionMaps } from './ExpeditionMapCompiler.js';
import { applyExpeditionMatchContext } from './ExpeditionMatchContext.js';
import { loadExpeditionProfile, saveExpeditionProfile } from './ExpeditionProfile.js';
import { activateExpeditionQuest } from './ExpeditionQuestLedger.js';
import { claimExpeditionQuestReward, recordExpeditionClear } from './ExpeditionRewards.js';
import { useExpeditionCitizenService } from './ExpeditionServices.js';
import { createExpeditionSnapshot } from './ExpeditionSnapshot.js';
import { expeditionLocationAvailability, nextExpeditionLocation } from './ExpeditionWorld.js';

/** Owns one local persistent Expedition profile and every authored world operation. */
export class ExpeditionModel {
	constructor(adventureProgress, baseMaps) {
		this.maps = compileExpeditionMaps(baseMaps);
		this.profile = loadExpeditionProfile(adventureProgress);
	}

	snapshot() {
		return createExpeditionSnapshot(this.profile, this.maps);
	}

	selectLocation(locationId) {
		const location = expeditionLocation(locationId);
		if (!location || !expeditionLocationAvailability(this.profile, location).available) {
			return null;
		}
		const map = this.maps.find(item => item.id === location.mapId) || null;
		if (!map) return null;
		this.profile = this.persist({ ...this.profile, activeLocationId: locationId });
		return map;
	}

	inspectLocation(locationId) {
		if (!this.profile.discovered.includes(locationId) || !expeditionLocation(locationId)) {
			return false;
		}
		this.profile = this.persist({ ...this.profile, activeLocationId: locationId });
		return true;
	}

	equip(gearId) {
		const result = equipExpeditionGear(this.profile, gearId);
		if (result.changed) this.profile = this.persist(result.profile);
		return result.changed;
	}

	activateQuest(questId) {
		const result = activateExpeditionQuest(this.profile, questId);
		if (result.changed) this.profile = this.persist(result.profile);
		return result.changed;
	}

	claimQuest(questId) {
		const result = claimExpeditionQuestReward(this.profile, questId);
		if (result.claimed) this.profile = this.persist(result.profile);
		return result;
	}

	purchase(shopId, offerIndex) {
		const result = purchaseExpeditionOffer(this.profile, shopId, offerIndex);
		if (result.purchased) this.profile = this.persist(result.profile);
		return result;
	}

	craft(recipeId) {
		const result = craftExpeditionRecipe(this.profile, recipeId, this.profile.activeLocationId);
		if (result.crafted) this.profile = this.persist(result.profile);
		return result;
	}

	useCitizen(citizenId) {
		const result = useExpeditionCitizenService(this.profile, citizenId);
		if (result.changed) this.profile = this.persist(result.profile);
		return result;
	}

	recordClear(mapId, run) {
		const location = expeditionLocationForMap(mapId);
		if (!location) return null;
		const result = recordExpeditionClear(this.profile, location.id, run);
		this.profile = this.persist(result.profile);
		return { ...result, location };
	}

	nextMap(currentMapId) {
		const current = expeditionLocationForMap(currentMapId);
		const next = current ? nextExpeditionLocation(this.profile, current.id) : null;
		return next ? this.maps.find(map => map.id === next.mapId) || null : null;
	}

	applyMatch(state) {
		return applyExpeditionMatchContext(state, this.profile, this.profile.activeLocationId);
	}

	replaceProfile(profile) {
		this.profile = this.persist(profile);
		return this.profile;
	}

	persist(profile) {
		return saveExpeditionProfile(profile);
	}
}
