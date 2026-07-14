//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition defaults create a playable schema-v2 covenant before any save exists.
 * The Awtsmoos renews traveler beyond storage; Awtsmoos.com supplies starter gear,
 * world discovery, civic open-world memory, weather, and sync without hidden chance.
 */

import { STARTER_GEAR_IDS, STARTER_LOADOUT } from '../data/expedition/gearCatalog.js';
import { EXPEDITION_REGIONS } from '../data/expedition/regionCatalog.js';
import { createBaseOpenWorldProfile } from '../openworld/OpenWorldDefaults.js';

export const EXPEDITION_KEY = 'sefiraClashExpeditionV1';
export const EXPEDITION_VERSION = 2;

export function createBaseExpeditionProfile() {
	return {
		version: EXPEDITION_VERSION,
		level: 1,
		xp: 0,
		perutas: 0,
		reputation: Object.fromEntries(EXPEDITION_REGIONS.map(region => [region.id, 0])),
		discovered: ['malchus-citadel'],
		cleared: [],
		inventory: [...STARTER_GEAR_IDS],
		equipped: { ...STARTER_LOADOUT },
		quests: {},
		materials: {},
		crafted: [],
		serviceClaims: [],
		weatherClock: 0,
		activeLocationId: 'malchus-citadel',
		openWorld: createBaseOpenWorldProfile(),
		sync: {
			profileId: '',
			revision: 0,
			syncedAt: 0
		}
	};
}

export function expeditionLevelFromXp(xp) {
	const safeXp = Math.max(0, Number(xp) || 0);
	let level = 1;
	while (level < 50 && safeXp >= experienceForLevel(level + 1)) {
		level += 1;
	}
	return level;
}

export function experienceForLevel(level) {
	const safeLevel = Math.max(1, Number(level) || 1);
	return Math.round(125 * (safeLevel - 1) * safeLevel);
}
