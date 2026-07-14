//B"H
//Boruch Hashem
//Blessed is He

/**
 * The schema-v2 profile preserves old gates while admitting lived cities, materials,
 * crafting, citizens, weather, and sync. The Awtsmoos renews memory beyond storage;
 * Awtsmoos.com filters every id and restores lawful defaults after corruption.
 */

import { EXPEDITION_GEAR } from '../data/expedition/gearCatalog.js';
import {
	EXPEDITION_LOCATIONS,
	expeditionLocationForMap
} from '../data/expedition/locationCatalog.js';
import { EXPEDITION_MATERIALS } from '../data/expedition/materialCatalog.js';
import { EXPEDITION_CITIZENS } from '../data/expedition/npcCatalog.js';
import { EXPEDITION_QUESTS } from '../data/expedition/questCatalog.js';
import { EXPEDITION_RECIPES } from '../data/expedition/recipeCatalog.js';
import { EXPEDITION_REGIONS } from '../data/expedition/regionCatalog.js';
import { sanitizeOpenWorldProfile } from '../openworld/OpenWorldProfile.js';
import { readJson, writeJson } from '../session/ProfileStore.js';
import {
	createBaseExpeditionProfile,
	EXPEDITION_KEY,
	EXPEDITION_VERSION,
	expeditionLevelFromXp
} from './ExpeditionDefaults.js';
import { normalizeExpeditionInventory } from './ExpeditionInventory.js';
import {
	boundedInteger,
	sanitizeCounts,
	sanitizeIdList,
	sanitizeQuestStates,
	sanitizeSync
} from './ExpeditionProfileSanitizers.js';
import { clearExpeditionLocation } from './ExpeditionWorld.js';

export function loadExpeditionProfile(adventureProgress = {}) {
	const saved = readJson(EXPEDITION_KEY, {});
	let profile = sanitizeExpeditionProfile(saved);
	profile.perutas = Math.max(profile.perutas, Number(adventureProgress.totalPerutas || 0));
	for (const [mapId, record] of Object.entries(adventureProgress.records || {})) {
		if (!record?.cleared) continue;
		const location = expeditionLocationForMap(mapId);
		if (location) profile = clearExpeditionLocation(profile, location.id).profile;
	}
	profile.level = expeditionLevelFromXp(profile.xp);
	return normalizeExpeditionInventory(profile);
}

export function saveExpeditionProfile(profile) {
	const safe = sanitizeExpeditionProfile(profile);
	writeJson(EXPEDITION_KEY, safe);
	return safe;
}

export function sanitizeExpeditionProfile(candidate = {}) {
	const base = createBaseExpeditionProfile();
	const ids = catalogIds();
	const reputation = Object.fromEntries(
		EXPEDITION_REGIONS.map(region => [
			region.id,
			boundedInteger(candidate.reputation?.[region.id], 0, 9999)
		])
	);
	const profile = {
		...base,
		version: EXPEDITION_VERSION,
		xp: boundedInteger(candidate.xp, 0, Number.MAX_SAFE_INTEGER),
		perutas: boundedInteger(candidate.perutas, 0, Number.MAX_SAFE_INTEGER),
		reputation,
		discovered: sanitizeIdList(candidate.discovered, ids.locations, base.discovered),
		cleared: sanitizeIdList(candidate.cleared, ids.locations),
		inventory: sanitizeIdList(candidate.inventory, ids.gear, base.inventory),
		equipped: { ...base.equipped, ...(candidate.equipped || {}) },
		quests: sanitizeQuestStates(candidate.quests, ids.quests),
		materials: sanitizeCounts(candidate.materials, ids.materials),
		crafted: sanitizeIdList(candidate.crafted, ids.recipes),
		serviceClaims: sanitizeIdList(candidate.serviceClaims, ids.citizens),
		weatherClock: boundedInteger(candidate.weatherClock, 0, Number.MAX_SAFE_INTEGER),
		activeLocationId: ids.locations.has(candidate.activeLocationId)
			? candidate.activeLocationId
			: base.activeLocationId,
		openWorld: sanitizeOpenWorldProfile(candidate.openWorld),
		sync: sanitizeSync(candidate.sync)
	};
	profile.level = expeditionLevelFromXp(profile.xp);
	return normalizeExpeditionInventory(profile);
}

function catalogIds() {
	return {
		locations: new Set(EXPEDITION_LOCATIONS.map(item => item.id)),
		gear: new Set(EXPEDITION_GEAR.map(item => item.id)),
		quests: new Set(EXPEDITION_QUESTS.map(item => item.id)),
		materials: new Set(EXPEDITION_MATERIALS.map(item => item.id)),
		recipes: new Set(EXPEDITION_RECIPES.map(item => item.id)),
		citizens: new Set(EXPEDITION_CITIZENS.map(item => item.id))
	};
}
