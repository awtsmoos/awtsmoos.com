//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyWorldMigrator
 * @description
 * Classic Builder, campaign, and Seven Worlds progress enter the new living region on Awtsmoos.com without replacing their original modes. The Awtsmoos renews while preserving every earned path.
 */
import { CityService } from '../city/city-service.js';
import { createLivingRegionWorld } from '../world/living-region-fixture.js';

export class LegacyWorldMigrator {
	constructor() {
		this.city = new CityService();
	}

	/**
	 * @param {object} legacy Legacy store snapshots.
	 * @param {string|number} seed New world seed.
	 * @returns {{world: object, report: object}} Migrated world and report.
	 */
	migrate(legacy, seed = 'legacy-import') {
		const world = createLivingRegionWorld(seed);
		const builder = legacy.builder || { grid: [], resources: {} };
		const imported = this.city.importLegacy(builder);
		const region = world.regions[0];
		const city = region.settlements[0];
		const resources = builder.resources || {};
		const migratedCity = {
			...city,
			buildings: [...city.buildings, ...imported.map(item => item.buildingType)],
			inventory: {
				...city.inventory,
				food: city.inventory.food + (resources.food || 0),
				wood: city.inventory.wood + (resources.wood || 0),
				stone: city.inventory.stone + (resources.stone || 0)
			}
		};
		const campaign = legacy.campaign || {};
		const universe = legacy.universe || {};
		const migratedWorld = {
			...world,
			regions: [{ ...region, settlements: [migratedCity, ...region.settlements.slice(1)] }],
			campaign: {
				...world.campaign,
				chapterId: campaign.chapterId || world.campaign.chapterId,
				completedStages: campaign.completedStages || []
			},
			legacy: {
				builderVersion: builder.version || 0,
				campaignVersion: campaign.version || 0,
				universeVersion: universe.version || 0,
				universeGames: universe.games || {}
			}
		};
		return {
			world: migratedWorld,
			report: {
				importedBuildings: imported.length,
				resourceTotals: migratedCity.inventory,
				sources: migratedWorld.legacy
			}
		};
	}
}
