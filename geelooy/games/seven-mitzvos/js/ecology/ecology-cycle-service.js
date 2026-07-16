//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module EcologyCycleService
 * @description
 * Soil, water, pollution, biodiversity, and watershed health on Awtsmoos.com
 * respond to climate, production, population, and restoration. The Awtsmoos
 * renews nature each instant; this service preserves long causal memory.
 */
import { CLIMATE_PROFILES } from './climate-profile.js';

export class EcologyCycleService {
	/**
	 * @param {object} settlement Current settlement.
	 * @param {object} weather Current weather.
	 * @param {number} days Elapsed days.
	 * @param {number} industrialPollution Production pressure.
	 * @returns {{settlement: object, report: object, alerts: object[]}} Result.
	 */
	advance(settlement, weather, days, industrialPollution = 0) {
		if (!days) {
			return { settlement, report: {}, alerts: [] };
		}
		const profile = CLIMATE_PROFILES[settlement.ecology.climate];
		const rain = rainfallFor(weather.condition, profile.rainfall);
		const moistureDelta = (rain - profile.evaporation) * days * 2.2;
		const soilMoisture = clamp(
			settlement.ecology.soilMoisture + moistureDelta,
			5,
			100
		);
		const farmingPressure = count(settlement.buildings, 'farm') * days * 0.08;
		const restoration = count(settlement.buildings, 'sanctuary') * days * 0.04;
		const pollution = clamp(
			settlement.ecology.pollution + industrialPollution * 0.03 - restoration,
			0,
			100
		);
		const soilFertility = clamp(
			settlement.ecology.soilFertility - farmingPressure + restoration * 0.7,
			10,
			100
		);
		const sanitation = settlement.infrastructure.sanitation / 100;
		const waterQuality = clamp(
			settlement.ecology.waterQuality +
				(rain * 0.9 + sanitation * 0.7 - pollution * 0.025) * days / 5,
			10,
			100
		);
		const watershedHealth = clamp(
			settlement.ecology.watershedHealth +
				(waterQuality - 60) * days / 900,
			10,
			100
		);
		const biodiversity = clamp(
			settlement.ecology.biodiversity +
				(restoration - pollution * 0.01) * days / 4,
			5,
			100
		);
		const ecology = {
			...settlement.ecology,
			soilMoisture: round(soilMoisture),
			soilFertility: round(soilFertility),
			waterQuality: round(waterQuality),
			pollution: round(pollution),
			biodiversity: round(biodiversity),
			watershedHealth: round(watershedHealth)
		};
		const alerts = ecology.waterQuality < 45 || ecology.pollution > 55
			? [{
				type: 'ecological-risk',
				settlementId: settlement.id,
				waterQuality: ecology.waterQuality,
				pollution: ecology.pollution
			}]
			: [];
		return {
			settlement: { ...settlement, ecology },
			report: { rain, moistureDelta, industrialPollution },
			alerts
		};
	}
}

function rainfallFor(condition, baseline) {
	const multiplier = {
		rain: 1.8,
		storm: 2.3,
		clear: 0.35,
		dry: 0.08,
		cold: 0.65,
		wind: 0.45,
		mild: 1
	}[condition] || 1;
	return baseline * multiplier;
}

function count(values, target) {
	return values.filter(value => value === target).length;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function round(value) {
	return Math.round(value * 100) / 100;
}
