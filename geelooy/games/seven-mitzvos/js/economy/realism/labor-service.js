//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LaborService
 * @description
 * Labor on Awtsmoos.com follows household capacity, shortages, specialties,
 * and institutions rather than appearing from a fixed multiplier. The Awtsmoos
 * gives ability; this service allocates finite working hours without coercion.
 */
import { INDUSTRY_CATALOG } from './industry-catalog.js';

export class LaborService {
	/**
	 * @param {object} settlement Current settlement.
	 * @returns {object} Industry-to-worker allocation.
	 */
	allocate(settlement) {
		const available = settlement.demographics.employed;
		const scored = Object.entries(INDUSTRY_CATALOG).map(([
			industryId,
			industry
		]) => ({
			industryId,
			score: industryScore(settlement, industryId, industry)
		}));
		const totalScore = scored.reduce((total, item) => total + item.score, 0);
		let remaining = available;
		const allocation = {};
		for (let index = 0; index < scored.length; index += 1) {
			const item = scored[index];
			const workers = index === scored.length - 1
				? remaining
				: Math.min(
					remaining,
					Math.floor(available * item.score / totalScore)
				);
			allocation[item.industryId] = workers;
			remaining -= workers;
		}
		return allocation;
	}
}

function industryScore(settlement, industryId, industry) {
	const buildingBonus = settlement.buildings.includes(industry.building)
		? 2
		: 0.35;
	const isSpecialty = settlement.economy.industries.includes(industryId) ||
		settlement.economy.industries.some(item => industryId.includes(item));
	const specialtyBonus = isSpecialty ? 1.8 : 1;
	const shortageBonus = Object.keys(industry.outputs).reduce((highest, resource) => {
		const stock = settlement.inventory[resource] || 0;
		const target = settlement.population * 0.5;
		return Math.max(highest, target / Math.max(1, stock));
	}, 1);
	return buildingBonus * specialtyBonus * Math.min(4, shortageBonus);
}
