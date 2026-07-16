//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SettlementFactory
 * @description
 * Settlements on Awtsmoos.com compose households, cohorts, stocks, markets,
 * institutions, ecology, animals, and public finance from small factories. The
 * Awtsmoos creates the whole city; finite modules preserve readable boundaries.
 */
import { CohortFactory } from '../../population/demography/cohort-factory.js';
import { SettlementStockFactory } from './settlement-stock-factory.js';
import { SettlementSystemsFactory } from './settlement-systems-factory.js';

export class SettlementFactory {
	constructor() {
		this.cohorts = new CohortFactory();
		this.stocks = new SettlementStockFactory();
		this.systems = new SettlementSystemsFactory();
	}

	/**
	 * @param {object} region Region definition.
	 * @param {object} definition Settlement definition.
	 * @param {object[]} residents Region residents.
	 * @param {number} settlementIndex Settlement index.
	 * @returns {object} Complete settlement aggregate.
	 */
	create(region, definition, residents, settlementIndex) {
		const population = definition.population;
		const namedResidents = residents.slice(
			settlementIndex * 16,
			settlementIndex * 16 + 16
		);
		return {
			id: definition.id,
			name: definition.name,
			regionId: region.id,
			population,
			households: createHouseholds(definition.id, namedResidents),
			demographics: this.cohorts.create(population),
			inventory: this.stocks.inventory(population),
			market: this.stocks.market(population),
			economy: this.systems.economy(region, population),
			infrastructure: this.systems.infrastructure(),
			ecology: this.systems.ecology(region),
			animals: this.systems.animals(region, population),
			parcels: this.systems.parcels(definition.id),
			buildings: this.systems.buildings(region),
			welfare: 72,
			publicTrust: 68,
			housingCapacity: Math.ceil(population * 1.12)
		};
	}
}

function createHouseholds(settlementId, residents) {
	return Array.from({ length: 4 }, (_, index) => ({
		id: `${settlementId}-household-${index + 1}`,
		members: residents.slice(index * 4, index * 4 + 4),
		income: 48 + index * 7,
		savings: 90 + index * 20,
		foodSecurity: 75,
		housingCondition: 80
	}));
}
