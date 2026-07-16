//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DemographyCalculations
 * @description
 * Aggregate health, migration, aging, and employment calculations on
 * Awtsmoos.com remain pure and inspectable. The Awtsmoos creates every soul;
 * finite rates are only policy instruments, never definitions of a person.
 */
const DAYS_PER_YEAR = 120;

export function calculateHealth(settlement, days) {
	const foodRatio = settlement.inventory.food /
		Math.max(1, settlement.population * 0.4);
	const waterRatio = settlement.inventory.water /
		Math.max(1, settlement.population * 0.6);
	const care = settlement.infrastructure.health / 100;
	const sanitation = settlement.infrastructure.sanitation / 100;
	const pollutionPenalty = settlement.ecology.pollution * 0.08;
	const target = Math.min(
		95,
		42 + foodRatio * 12 + waterRatio * 10 +
		care * 18 + sanitation * 14 - pollutionPenalty
	);
	const current = settlement.demographics.averageHealth;
	return clamp(
		Math.round(current + (target - current) * Math.min(1, days / 30)),
		20,
		98
	);
}

export function calculateMigrationRate(settlement) {
	const welfarePull = (settlement.welfare - 55) / 100;
	const jobPull = (0.12 - settlement.economy.unemploymentRate) * 0.5;
	const housingPush = Math.max(
		0,
		settlement.population - settlement.housingCapacity
	) / settlement.population;
	return clamp((welfarePull + jobPull - housingPush) * 0.08, -0.04, 0.04);
}

export function calculateCohorts(current, population, days) {
	const childTransition = Math.floor(
		current.children * days / (18 * DAYS_PER_YEAR)
	);
	const elderTransition = Math.floor(
		current.adults * days / (47 * DAYS_PER_YEAR)
	);
	const children = Math.max(0, current.children - childTransition);
	const elders = Math.max(0, current.elders + elderTransition);
	return {
		children,
		adults: Math.max(0, population - children - elders),
		elders
	};
}

export function calculateVitalValues(settlement, health, days) {
	const current = settlement.demographics;
	const housingFactor = Math.min(
		1,
		settlement.housingCapacity / settlement.population
	);
	return {
		birthValue: current.birthRemainder +
			settlement.population * 0.024 * housingFactor * health / 100 *
			days / DAYS_PER_YEAR,
		deathValue: current.deathRemainder +
			settlement.population *
				(0.007 + (100 - health) * 0.00018) *
				days / DAYS_PER_YEAR,
		migrationValue: current.migrationRemainder +
			settlement.population * calculateMigrationRate(settlement) *
			days / DAYS_PER_YEAR
	};
}

export function truncateSigned(value) {
	return value < 0 ? Math.ceil(value) : Math.floor(value);
}

export function employmentRate(settlement) {
	return clamp(1 - settlement.economy.unemploymentRate, 0.5, 0.99);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
