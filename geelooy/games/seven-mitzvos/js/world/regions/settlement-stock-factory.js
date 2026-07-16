//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SettlementStockFactory
 * @description
 * Material stocks and market listings on Awtsmoos.com scale from population
 * through explicit formulas. The Awtsmoos provides every resource; finite
 * settlements begin with visible reserves, prices, and trading memory.
 */
export class SettlementStockFactory {
	/**
	 * @param {number} population Settlement population.
	 * @returns {object} Resource inventory.
	 */
	inventory(population) {
		return {
			coin: population * 5,
			food: Math.round(population * 1.15),
			water: Math.round(population * 1.7),
			grain: Math.round(population * 0.75),
			wood: Math.round(population * 0.38),
			timber: Math.round(population * 0.18),
			stone: Math.round(population * 0.28),
			tools: Math.round(population * 0.08),
			medicine: Math.round(population * 0.06),
			textiles: Math.round(population * 0.1),
			herbs: Math.round(population * 0.08),
			fish: Math.round(population * 0.04),
			livestock: Math.round(population * 0.025)
		};
	}

	/**
	 * @param {number} population Settlement population.
	 * @returns {object} Market stock and listings.
	 */
	market(population) {
		return {
			stock: this.inventory(Math.round(population * 0.35)),
			listings: {
				food: listing(3, 22, 18),
				water: listing(2, 28, 16),
				grain: listing(2, 20, 17),
				medicine: listing(9, 7, 12),
				textiles: listing(6, 11, 9),
				tools: listing(8, 8, 10),
				fish: listing(4, 9, 8)
			}
		};
	}
}

function listing(basePrice, supply, demand) {
	return {
		basePrice,
		price: basePrice,
		supply,
		demand,
		history: [basePrice]
	};
}
