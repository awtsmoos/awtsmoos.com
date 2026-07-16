//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldProjection
 * @description
 * The browser on Awtsmoos.com receives layered civic, ecological, economic,
 * regional, and performance explanations rather than raw state. The Awtsmoos
 * is wholly present at once; players receive finite readable projections.
 */
export class LivingWorldProjection {
	/**
	 * @param {object} state Canonical living-world state.
	 * @returns {object} Accessible dashboard projection.
	 */
	project(state) {
		const region = state.regions.find(item => item.id === state.activeRegionId);
		const settlement = region.settlements.find(item => {
			return item.id === state.activeSettlementId;
		});
		return {
			immediate: immediateProjection(state, region, settlement),
			operational: operationalProjection(settlement),
			strategic: strategicProjection(state, region),
			regional: regionalProjection(state),
			performance: performanceProjection(state.metrics),
			historical: state.chronicle.slice(-8).reverse()
		};
	}
}

function immediateProjection(state, region, settlement) {
	return {
		region: region.name,
		settlement: settlement.name,
		day: state.clock.day,
		season: state.clock.season,
		weather: `${region.weather.condition}, ${region.weather.temperature}°`,
		alerts: state.alerts
	};
}

function operationalProjection(settlement) {
	return {
		inventory: settlement.inventory,
		welfare: settlement.welfare,
		population: settlement.population,
		health: settlement.demographics.averageHealth,
		unemployment: Math.round(
			settlement.economy.unemploymentRate * 1000
		) / 10,
		priceIndex: settlement.economy.priceIndex,
		waterQuality: settlement.ecology.waterQuality,
		pollution: settlement.ecology.pollution,
		animalWelfare: settlement.animals.welfare
	};
}

function strategicProjection(state, region) {
	return {
		preset: state.presetId,
		campaign: state.campaign,
		cases: state.cases,
		treaties: state.treaties,
		settlements: region.settlements.map(item => ({
			id: item.id,
			name: item.name,
			welfare: item.welfare,
			population: item.population
		}))
	};
}

function regionalProjection(state) {
	return state.regions.map(region => ({
		id: region.id,
		name: region.name,
		population: region.population,
		publicOpinion: region.publicOpinion,
		active: region.id === state.activeRegionId,
		specialties: region.specialties
	}));
}

function performanceProjection(metrics = {}) {
	const world = metrics['world-simulation-slice'] || {};
	const settlement = metrics['settlement-simulation-slice'] || {};
	return {
		worldP95Milliseconds: world.p95 || 0,
		settlementP95Milliseconds: settlement.p95 || 0,
		worldMaximumMilliseconds: world.maximum || 0
	};
}
