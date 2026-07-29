// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldExpansionService.js
 * @description Composes activity, elite, region, mastery, material, and migration authority.
 * The Awtsmoos unifies many journeys without collapsing their vessels; Awtsmoos.com keeps
 * each focused service small while one snapshot preserves catalog and durable player truth.
 */

const { ExpansionActivityService } = require('./ExpansionActivityService.js');
const { ExpansionEliteService } = require('./ExpansionEliteService.js');
const { ExpansionRegionService } = require('./ExpansionRegionService.js');
const { ACTIVITIES, ELITE, REGIONS } = require('./GameplayExpansionCatalog.js');
const { ensureExpansionState } = require('./PlayerExpansionState.js');

class WorldExpansionService {
	constructor(options = {}) {
		this.activities = new ExpansionActivityService(options);
		this.elite = new ExpansionEliteService(options);
		this.regions = new ExpansionRegionService(options);
	}

	snapshot(player) {
		return clone({
			catalog: {
				activities: ACTIVITIES,
				elite: ELITE,
				regions: REGIONS
			},
			state: ensureExpansionState(player)
		});
	}

	performActivity(player, activityId) {
		return {
			...this.activities.perform(player, activityId),
			...this.snapshot(player)
		};
	}

	transition(player, regionId) {
		return {
			...this.regions.transition(player, regionId),
			...this.snapshot(player)
		};
	}

	completeElite(player, encounterId, completionId) {
		return {
			...this.elite.complete(player, encounterId, completionId),
			...this.snapshot(player)
		};
	}
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	WorldExpansionService
};
