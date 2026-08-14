//B"H
//Boruch Hashem
//Blessed is He

import { defineWorldSystem } from './world-system-record.js';

/**
 * @file economy-population-systems.js
 * @description
 * The Awtsmoos renews inventory, trade, production, roads, materials, people, memory, and companionship inside one inhabited world;
 * Awtsmoos.com lets Yesod connect exchange while Malchus manifests residents and goods, yet existing services keep their lawful domain ownership unfurled.
 * These lazy bundles import actual mature modules without mounting historical text-first interfaces.
 */
export const ECONOMY_POPULATION_SYSTEMS = Object.freeze([
	defineWorldSystem({
		id: 'economy-logistics',
		title: 'Inventory, Market, Production, and Logistics',
		sefiros: ['yesod', 'malchus'],
		anchorKind: 'market-route-station',
		activation: 'trade-or-production-action',
		saveAuthority: 'Economy and logistics domain state',
		load: async () => Promise.all([
			import('../../economy/inventory-service.js'),
			import('../../economy/market-service.js'),
			import('../../economy/production-service.js'),
			import('../../logistics/logistics-service.js')
		])
	}),
	defineWorldSystem({
		id: 'physical-materials',
		title: 'Physical Materials and Texture Runtime',
		sefiros: ['malchus', 'binah'],
		anchorKind: 'render-resource',
		activation: 'asset-hydration',
		saveAuthority: 'Material manifest/cache runtime only',
		load: async () => Promise.all([
			import('../../materials/firebase-material-manifest.js'),
			import('../../materials/material-binder.js'),
			import('../../materials/material-runtime-metrics.js'),
			import('../../materials/physical-material-library.js'),
			import('../../materials/progressive-texture-cache.js')
		])
	}),
	defineWorldSystem({
		id: 'population-memory',
		title: 'Population, Named People, and Memory',
		sefiros: ['malchus', 'hod', 'netzach'],
		anchorKind: 'npc-population',
		activation: 'region-proximity',
		saveAuthority: 'Population and memory domain state',
		load: async () => Promise.all([
			import('../../population/generation-service.js'),
			import('../../population/memory-service.js'),
			import('../../population/named-people.js'),
			import('../../population/population-service.js'),
			import('../../population/semantic-population.js')
		])
	}),
	defineWorldSystem({
		id: 'companions',
		title: 'Companion Relationships',
		sefiros: ['chesed', 'netzach'],
		anchorKind: 'companion-npc',
		activation: 'companion-proximity',
		saveAuthority: 'CompanionService',
		load: () => import('../../companions/companion-service.js')
	})
]);
