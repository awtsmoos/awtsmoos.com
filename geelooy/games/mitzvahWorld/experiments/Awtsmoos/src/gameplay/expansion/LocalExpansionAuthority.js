// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalExpansionAuthority.js
 * @description Mirrors server activities, travel, elite, upgrade, bounty, and mastery semantics.
 * The Awtsmoos makes cooperation optional rather than compulsory; Awtsmoos.com keeps cooldown,
 * region, material, mastery, exact reward, upgrade, and bounty receipts equal in explicit solo.
 */

import {
	EXPANSION_ACTIVITIES,
	EXPANSION_ELITE,
	EXPANSION_REGIONS
} from './ExpansionCatalog.js';
import { createLocalExpansionState } from './LocalExpansionState.js';
import {
	claimLocalBounty,
	upgradeLocalEquipment
} from './LocalExpansionProgression.js';
import { canonicalEliteId, canonicalRegionId } from './RegionIdentity.js';

export class LocalExpansionAuthority {
	constructor(clock = Date.now, initialState = null) {
		this.clock = clock;
		this.state = createLocalExpansionState(initialState);
	}

	progressionSnapshot() { return this.receipt(); }

	performActivity(activityId) {
		const activity = EXPANSION_ACTIVITIES[activityId];
		if (!activity) throw new Error('UNKNOWN_ACTIVITY');
		if (this.state.region.id !== activity.regionId) throw new Error('ACTIVITY_REGION_MISMATCH');
		const now = this.clock();
		const previous = this.state.activities[activityId];
		if (previous && now - previous.completedAt < activity.cooldownMs) {
			return { ...this.receipt(), duplicate: true };
		}
		this.state.activities[activityId] = {
			completedAt: now,
			count: Number(previous?.count || 0) + 1
		};
		this.addMaterial(activity.materialId, activity.quantity);
		this.gainMastery(activity.masteryId, 10);
		return { ...this.receipt(), duplicate: false };
	}

	transitionRegion(requestedRegionId) {
		const regionId = canonicalRegionId(requestedRegionId);
		if (!EXPANSION_REGIONS[regionId]) throw new Error('UNKNOWN_REGION');
		this.state.region = {
			checkpoint: regionId,
			id: regionId,
			transitionedAt: this.clock()
		};
		return this.receipt();
	}

	completeElite(requestedEliteId, completionId) {
		const eliteId = canonicalEliteId(requestedEliteId);
		if (eliteId !== EXPANSION_ELITE.id) throw new Error('UNKNOWN_ENCOUNTER');
		if (this.state.region.id !== EXPANSION_ELITE.regionId) throw new Error('ENCOUNTER_REGION_MISMATCH');
		if (this.state.encounters[completionId]
			|| this.state.rewardIds.includes(EXPANSION_ELITE.rewardId)) {
			return { ...this.receipt(), duplicate: true };
		}
		this.state.encounters[completionId] = {
			completedAt: this.clock(),
			encounterId: eliteId
		};
		this.state.rewardIds.push(EXPANSION_ELITE.rewardId);
		this.addMaterial('warden-seal', 1);
		if (!this.state.unlocks.includes(EXPANSION_ELITE.unlockId)) {
			this.state.unlocks.push(EXPANSION_ELITE.unlockId);
		}
		return { ...this.receipt(), duplicate: false };
	}

	upgradeEquipment(upgradeId) {
		return { ...this.receipt(), ...upgradeLocalEquipment(this, upgradeId) };
	}

	claimBounty(bountyId) {
		return { ...this.receipt(), ...claimLocalBounty(this, bountyId) };
	}

	gainMastery(masteryId, quantity) {
		this.state.mastery[masteryId] = Number(this.state.mastery[masteryId] || 0)
			+ Number(quantity || 0);
	}

	addMaterial(materialId, quantity) {
		this.state.materials[materialId] = Number(this.state.materials[materialId] || 0)
			+ quantity;
	}

	receipt() { return { payload: structuredClone(this.state) }; }
}
