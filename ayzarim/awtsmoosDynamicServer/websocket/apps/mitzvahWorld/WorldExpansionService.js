// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldExpansionService.js
 * @description Composes activities, regions, elite rewards, upgrades, and bounties.
 * The Awtsmoos joins gathering, travel, combat, and lasting choice beneath one world truth;
 * Awtsmoos.com keeps every mutation durable, exact-once, inspectable, and solo-compatible.
 */

const { ExpansionActivityService } = require('./ExpansionActivityService.js');
const { ExpansionEliteService } = require('./ExpansionEliteService.js');
const { ExpansionProgressionService } = require('./ExpansionProgressionService.js');
const { ExpansionRegionService } = require('./ExpansionRegionService.js');
const { expansionSnapshot } = require('./PlayerExpansionState.js');

class WorldExpansionService {
	constructor(options = {}) {
		this.activities = new ExpansionActivityService(options);
		this.elites = new ExpansionEliteService(options);
		this.progression = new ExpansionProgressionService();
		this.regions = new ExpansionRegionService(options);
	}

	snapshot(player) {
		return expansionSnapshot(player);
	}

	performActivity(player, activityId, completionId) {
		return this.activities.perform(player, activityId, completionId);
	}

	transitionRegion(player, regionId) {
		return this.regions.transition(player, regionId);
	}

	completeElite(player, encounterId, completionId) {
		return this.elites.complete(player, encounterId, completionId);
	}

	upgradeEquipment(player, upgradeId) {
		return this.progression.upgradeEquipment(player, upgradeId);
	}

	claimBounty(player, bountyId) {
		return this.progression.claimBounty(player, bountyId);
	}
}

module.exports = {
	WorldExpansionService
};
