//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InfrastructureCycleService
 * @description
 * Roads, water, sanitation, clinics, schools, and storage on Awtsmoos.com age
 * under use and recover through transparent maintenance. The Awtsmoos never
 * decays; finite civic vessels require budgets, labor, and timely repair.
 */
export class InfrastructureCycleService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {number} days Elapsed days.
	 * @param {object|null} disaster Current disaster.
	 * @returns {{settlement: object, report: object, alerts: object[]}} Result.
	 */
	advance(settlement, days, disaster = null) {
		if (!days) {
			return { settlement, report: {}, alerts: [] };
		}
		const systems = Object.entries(settlement.infrastructure);
		const budget = Math.min(
			settlement.economy.treasury,
			Math.round(settlement.population * days * 0.006)
		);
		const perSystem = systems.length ? budget / systems.length : 0;
		const disasterLoss = disaster ? disaster.infrastructureLoss : 0;
		const infrastructure = {};
		for (const [system, condition] of systems) {
			const usePressure = usePressureFor(system, settlement.population, days);
			const repair = perSystem / Math.max(10, settlement.population * 0.01);
			infrastructure[system] = round(clamp(
				condition - usePressure - disasterLoss + repair,
				5,
				100
			));
		}
		const treasury = Math.max(0, settlement.economy.treasury - budget);
		const critical = Object.entries(infrastructure)
			.filter(([, condition]) => condition < 45)
			.map(([system]) => system);
		const next = {
			...settlement,
			infrastructure,
			economy: { ...settlement.economy, treasury }
		};
		const alerts = critical.length
			? [{
				type: 'infrastructure-risk',
				settlementId: settlement.id,
				systems: critical
			}]
			: [];
		return {
			settlement: next,
			report: { maintenanceBudget: budget, critical },
			alerts
		};
	}
}

function usePressureFor(system, population, days) {
	const intensity = {
		roads: 0.003,
		water: 0.0035,
		sanitation: 0.0032,
		health: 0.002,
		education: 0.0016,
		storage: 0.0018
	}[system] || 0.002;
	return population * intensity * days / 100;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function round(value) {
	return Math.round(value * 100) / 100;
}
