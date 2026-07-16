//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SettlementSystemsFactory
 * @description
 * Economy, infrastructure, ecology, animals, parcels, and institutions on
 * Awtsmoos.com begin as explicit civic systems. The Awtsmoos fills every vessel;
 * this factory keeps their responsibilities visible and separately evolvable.
 */
export class SettlementSystemsFactory {
	/**
	 * @param {object} region Region definition.
	 * @param {number} population Settlement population.
	 * @returns {object} Initial economic system.
	 */
	economy(region, population) {
		return {
			treasury: population * 2,
			taxRate: 0.08,
			averageWage: 12,
			unemploymentRate: 0.09,
			priceIndex: 1,
			inflation: 0,
			industries: [...region.specialties],
			contracts: [],
			tradeBalance: 0
		};
	}

	infrastructure() {
		return {
			roads: 84,
			water: 82,
			sanitation: 76,
			health: 74,
			education: 72,
			storage: 78
		};
	}

	ecology(region) {
		return {
			climate: region.climate,
			soilMoisture: region.climate.includes('arid') ? 38 : 68,
			soilFertility: 72,
			waterQuality: 80,
			pollution: 12,
			biodiversity: 74,
			watershedHealth: 78
		};
	}

	animals(region, population) {
		return {
			domestic: Math.round(population * 0.07),
			working: Math.round(population * 0.018),
			sheltered: Math.round(population * 0.012),
			welfare: region.specialties.includes('animals') ? 88 : 76,
			sanctuaryCapacity: Math.round(population * 0.02)
		};
	}

	parcels(settlementId) {
		const allowed = [
			'farm',
			'school',
			'clinic',
			'court',
			'sanctuary',
			'warehouse',
			'workshop',
			'well',
			'housing',
			'market'
		];
		return Array.from({ length: 12 }, (_, index) => ({
			id: `${settlementId}-parcel-${index + 1}`,
			allowed,
			building: null
		}));
	}

	buildings(region) {
		const base = [
			'housing',
			'market',
			'warehouse',
			'clinic',
			'school',
			'court',
			'sanctuary',
			'farm',
			'well',
			'workshop'
		];
		return [...new Set([...base, ...region.specialties])];
	}
}
