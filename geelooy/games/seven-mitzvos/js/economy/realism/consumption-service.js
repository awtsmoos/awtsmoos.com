//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ConsumptionService
 * @description
 * Daily needs and spoilage on Awtsmoos.com are derived from population and
 * declared resource properties. The Awtsmoos sustains all life; finite stores
 * reveal shortage, loss, and conservation rather than hiding them.
 */
import { RESOURCE_CATALOG } from './resource-catalog.js';

export class ConsumptionService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {number} days Elapsed days.
	 * @returns {{inventory: object, shortages: object, consumed: object, lost: object}} Result.
	 */
	consume(settlement, days) {
		const inventory = { ...settlement.inventory };
		const shortages = {};
		const consumed = {};
		const lost = {};
		for (const [resource, definition] of Object.entries(RESOURCE_CATALOG)) {
			const current = inventory[resource] || 0;
			const needed = Math.round(
				settlement.population * definition.dailyPerPerson * days
			);
			const spoilage = Math.min(
				current,
				Math.round(current * definition.dailyLossRate * days)
			);
			const available = Math.max(0, current - spoilage);
			const used = Math.min(available, needed);
			inventory[resource] = available - used;
			consumed[resource] = used;
			lost[resource] = spoilage;
			if (used < needed) {
				shortages[resource] = needed - used;
			}
		}
		return { inventory, shortages, consumed, lost };
	}
}
