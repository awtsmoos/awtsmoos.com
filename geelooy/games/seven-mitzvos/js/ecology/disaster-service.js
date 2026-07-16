//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DisasterService
 * @description
 * Flood, drought, storm, fire, and landslide risk on Awtsmoos.com emerge from
 * climate, damaged ecology, and deterministic time. The Awtsmoos rules every
 * event; finite communities receive warnings, losses, and restorative choices.
 */
import { stableHash } from '../core/identity/id-factory.js';
import { CLIMATE_PROFILES } from './climate-profile.js';

export class DisasterService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {object} calendar Current calendar.
	 * @param {string|number} seed Stable world seed.
	 * @returns {object|null} Deterministic disaster or null.
	 */
	evaluate(settlement, calendar, seed) {
		const profile = CLIMATE_PROFILES[settlement.ecology.climate];
		const ecologicalRisk = (
			settlement.ecology.pollution +
			(100 - settlement.ecology.watershedHealth) +
			(100 - settlement.infrastructure.roads)
		) / 300;
		const threshold = Math.min(0.18, 0.008 + ecologicalRisk * 0.05);
		const roll = stableHash(
			`${seed}:${settlement.id}:${calendar.year}:${calendar.day}`
		) / 4294967295;
		if (roll >= threshold) {
			return null;
		}
		const severity = Math.max(
			1,
			Math.min(5, 1 + Math.floor(ecologicalRisk * 5))
		);
		return {
			id: `disaster-${settlement.id}-${calendar.day}`,
			type: profile.primaryHazard,
			settlementId: settlement.id,
			severity,
			populationAtRisk: Math.round(settlement.population * severity * 0.025),
			infrastructureLoss: severity * 2,
			resourceLossRate: severity * 0.02
		};
	}

	/**
	 * @param {object} settlement Current settlement.
	 * @param {object} disaster Disaster declaration.
	 * @returns {object} Settlement after bounded losses.
	 */
	apply(settlement, disaster) {
		if (!disaster) {
			return settlement;
		}
		const inventory = Object.fromEntries(
			Object.entries(settlement.inventory).map(([resource, quantity]) => {
				return [
					resource,
					Math.max(0, Math.round(quantity * (1 - disaster.resourceLossRate)))
				];
			})
		);
		const infrastructure = Object.fromEntries(
			Object.entries(settlement.infrastructure).map(([system, condition]) => {
				return [system, Math.max(10, condition - disaster.infrastructureLoss)];
			})
		);
		return {
			...settlement,
			inventory,
			infrastructure,
			welfare: Math.max(0, settlement.welfare - disaster.severity * 3)
		};
	}
}
