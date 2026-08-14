//B"H
//Boruch Hashem
//Blessed is He

import { defineWorldSystem } from './world-system-record.js';

/**
 * @file manifested-systems.js
 * @description
 * The Awtsmoos renews covenant encounter, civic building, Realm passage, and campaign purpose inside one visible world;
 * Awtsmoos.com keeps these great oros behind lazy keilim so Malchus can remain responsive while deeper regions awaken when entered.
 * Existing domain registries and repositories remain authoritative; this catalog only describes how the one world reaches them.
 */
export const MANIFESTED_WORLD_SYSTEMS = Object.freeze([
	defineWorldSystem({
		id: 'mitzvah-encounters',
		title: 'Seven Mitzvah WebGL Encounters',
		sefiros: ['malchus', 'tiferes'],
		anchorKind: 'district',
		activation: 'encounter-proximity',
		saveAuthority: 'UniverseProgress / GameSession',
		load: () => import('../../games3d/game-registry.js')
	}),
	defineWorldSystem({
		id: 'civic-construction',
		title: 'Living World Civic Construction',
		sefiros: ['malchus', 'gevurah'],
		anchorKind: 'parcel',
		activation: 'nearby-parcel',
		saveAuthority: 'LivingWorldKernel / BrowserSaveCoordinator local slot',
		load: () => import('../open-world-civic-service.js')
	}),
	defineWorldSystem({
		id: 'covenant-realm',
		title: 'Covenant Realm',
		sefiros: ['yesod', 'netzach'],
		anchorKind: 'portal',
		activation: 'portal-entry',
		saveAuthority: 'RealmRepository',
		load: async () => {
			return Promise.all([
				import('../../realm/realm-runtime.js'),
				import('../../realm/realm-repository.js'),
				import('../../realm/realm-projects.js'),
				import('../../realm/realm-resources.js'),
				import('../../realm/skill-network.js'),
				import('../../realm/world-memory-graph.js')
			]);
		}
	}),
	defineWorldSystem({
		id: 'campaign-quests',
		title: 'Campaign Quest Domain',
		sefiros: ['keser', 'binah', 'tiferes'],
		anchorKind: 'quest-network',
		activation: 'quest-anchor',
		saveAuthority: 'CampaignStore / CampaignState',
		load: async () => {
			return Promise.all([
				import('../../campaign/campaign-engine.js'),
				import('../../campaign/campaign-definitions.js'),
				import('../../campaign/campaign-store.js'),
				import('../../campaign/campaign-stage-runner.js'),
				import('../../campaign/province-conditions.js')
			]);
		}
	})
]);
