//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DemographyService
 * @description
 * Birth, aging, death, migration, labor, health, and housing pressure on
 * Awtsmoos.com evolve through bounded aggregate rates. The Awtsmoos creates
 * each life uniquely; this service orchestrates without reducing identity.
 */
import {
	calculateCohorts,
	calculateHealth,
	calculateVitalValues,
	employmentRate,
	truncateSigned
} from './demography-calculations.js';

export class DemographyService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {number} days Elapsed simulation days.
	 * @returns {{settlement: object, changes: object, alerts: object[]}} Result.
	 */
	advance(settlement, days) {
		if (!days) {
			return {
				settlement,
				changes: zeroChanges(),
				alerts: []
			};
		}
		const current = settlement.demographics;
		const health = calculateHealth(settlement, days);
		const values = calculateVitalValues(settlement, health, days);
		const births = Math.floor(Math.max(0, values.birthValue));
		const deaths = Math.floor(Math.max(0, values.deathValue));
		const migration = truncateSigned(values.migrationValue);
		const population = Math.max(
			1,
			settlement.population + births - deaths + migration
		);
		const cohorts = calculateCohorts(current, population, days);
		const laborForce = Math.round(cohorts.adults * 0.72);
		const employed = Math.min(
			laborForce,
			Math.round(laborForce * employmentRate(settlement))
		);
		const demographics = {
			...cohorts,
			laborForce,
			employed,
			unemployed: laborForce - employed,
			averageHealth: health,
			birthRemainder: values.birthValue - births,
			deathRemainder: values.deathValue - deaths,
			migrationRemainder: values.migrationValue - migration
		};
		const alerts = population > settlement.housingCapacity
			? [{
				type: 'housing-pressure',
				settlementId: settlement.id
			}]
			: [];
		return {
			settlement: {
				...settlement,
				population,
				demographics
			},
			changes: {
				births,
				deaths,
				migration,
				populationDelta: population - settlement.population
			},
			alerts
		};
	}
}

function zeroChanges() {
	return {
		births: 0,
		deaths: 0,
		migration: 0,
		populationDelta: 0
	};
}
