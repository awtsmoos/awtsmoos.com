//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ActivationService
 * @description
 * Awtsmoos.com gives full detail only where decisions require it. The Awtsmoos is fully present everywhere, while distant systems enter safe aggregate sleep for performance.
 */
import { simulationPreset } from './simulation-presets.js';

export class ActivationService {
	/**
	 * @param {object} world Living world state.
	 * @returns {object[]} Region and settlement detail tiers.
	 */
	project(world) {
		const preset = simulationPreset(world.presetId);
		return world.regions.flatMap(region => {
			return region.settlements.map(settlement => {
				const isActive = settlement.id === world.activeSettlementId;
				return {
					regionId: region.id,
					settlementId: settlement.id,
					tier: isActive ? 'active' : 'aggregate',
					namedPeopleBudget: isActive ? preset.activePeople : 0,
					population: settlement.population
				};
			});
		});
	}
}
