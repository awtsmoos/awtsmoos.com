//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AnimalWelfareService
 * @description
 * Animals on Awtsmoos.com require food, water, shelter, care, and capacity
 * rather than serving as decorative inventory. The Awtsmoos sustains every
 * living creature; civic systems are judged by how faithfully they protect it.
 */
export class AnimalWelfareService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {number} days Elapsed days.
	 * @param {object|null} disaster Current disaster.
	 * @returns {{settlement: object, alerts: object[]}} Result.
	 */
	advance(settlement, days, disaster = null) {
		if (!days) {
			return { settlement, alerts: [] };
		}
		const animals = settlement.animals;
		const totalAnimals = animals.domestic + animals.working + animals.sheltered;
		const foodCoverage = Math.min(
			1,
			settlement.inventory.food / Math.max(1, totalAnimals * 0.08 * days)
		);
		const waterCoverage = Math.min(
			1,
			settlement.inventory.water / Math.max(1, totalAnimals * 0.12 * days)
		);
		const capacityCoverage = Math.min(
			1,
			animals.sanctuaryCapacity / Math.max(1, animals.sheltered)
		);
		const disasterPenalty = disaster ? disaster.severity * 5 : 0;
		const target = 30 +
			foodCoverage * 22 +
			waterCoverage * 22 +
			capacityCoverage * 20 -
			disasterPenalty;
		const welfare = clamp(
			Math.round(animals.welfare + (target - animals.welfare) * Math.min(1, days / 15)),
			0,
			100
		);
		const sheltered = disaster
			? animals.sheltered + Math.round(disaster.populationAtRisk * 0.08)
			: animals.sheltered;
		const next = {
			...settlement,
			animals: { ...animals, sheltered, welfare }
		};
		const alerts = welfare < 50 || sheltered > animals.sanctuaryCapacity
			? [{
				type: 'animal-welfare-risk',
				settlementId: settlement.id,
				welfare,
				overCapacity: Math.max(0, sheltered - animals.sanctuaryCapacity)
			}]
			: [];
		return { settlement: next, alerts };
	}
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
