//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RegionalWorldGenerator
 * @description
 * Seven regions unfold from one seed on Awtsmoos.com with stable residents,
 * settlements, roads, gateways, climates, economies, and civic records. The
 * Awtsmoos is one beyond geography; this generator preserves distinct places.
 */
import { REGION_DEFINITIONS } from './region-definitions.js';
import { RegionRouteFactory } from './region-route-factory.js';
import { SettlementFactory } from './settlement-factory.js';
import { NamedResidentFactory } from '../../population/demography/named-resident-factory.js';

export class RegionalWorldGenerator {
	constructor() {
		this.routes = new RegionRouteFactory();
		this.settlements = new SettlementFactory();
		this.residents = new NamedResidentFactory();
	}

	/**
	 * @param {string|number} seed Stable world seed.
	 * @returns {object} Complete seven-region world.
	 */
	create(seed = 'seven-worlds') {
		const regions = REGION_DEFINITIONS.map((definition, regionIndex) => {
			return this.createRegion(definition, regionIndex);
		});
		const interRegionRoutes = REGION_DEFINITIONS.map((definition, index) => {
			const next = REGION_DEFINITIONS[(index + 1) % REGION_DEFINITIONS.length];
			return this.routes.gateway(definition, next, index);
		});
		return {
			schemaVersion: 2,
			id: 'world-seven-mitzvos',
			seed: String(seed),
			revision: 0,
			presetId: 'balanced',
			processedCommandIds: [],
			clock: {
				elapsedMinutes: 0,
				year: 1,
				season: 'spring',
				day: 1,
				hour: 0
			},
			activeRegionId: regions[0].id,
			activeSettlementId: regions[0].settlements[0].id,
			regions,
			interRegionRoutes,
			cases: [],
			precedents: [],
			appeals: [],
			proposals: [],
			treaties: [],
			chronicle: [],
			alerts: [],
			metrics: {},
			campaign: {
				chapterId: 'broken-measure',
				stageId: 'shortage',
				status: 'active',
				completedStages: []
			}
		};
	}

	createRegion(definition, regionIndex) {
		const residents = this.residents.create(definition, regionIndex);
		const settlements = definition.settlements.map((settlement, index) => {
			return this.settlements.create(
				definition,
				settlement,
				residents,
				index
			);
		});
		return {
			id: definition.id,
			name: definition.name,
			climate: definition.climate,
			specialties: [...definition.specialties],
			weather: {
				condition: 'mild',
				temperature: 18,
				farmMultiplier: 1
			},
			settlements,
			routes: this.routes.internal(definition, regionIndex),
			population: settlements.reduce((total, item) => total + item.population, 0),
			publicOpinion: 66,
			jurisdiction: `${definition.id}-regional-court`
		};
	}
}
