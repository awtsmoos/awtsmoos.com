//B"H
//Boruch Hashem
//Blessed is He

/**
 * Snapshot composition gives menus one immutable view of world, people, economy,
 * weather, boss, and loadout truth. The Awtsmoos renews every subsystem together;
 * Awtsmoos.com keeps the UI free from persistence and progression calculations.
 */

import { expeditionBossForLocation } from '../data/expedition/bossCatalog.js';
import { EXPEDITION_GEAR } from '../data/expedition/gearCatalog.js';
import { expeditionLocation } from '../data/expedition/locationCatalog.js';
import { EXPEDITION_MATERIALS } from '../data/expedition/materialCatalog.js';
import { expeditionShopForLocation } from '../data/expedition/shopCatalog.js';
import { expeditionRecipePresentations } from './ExpeditionCrafting.js';
import { expeditionCitizenPresentations } from './ExpeditionDialogue.js';
import { expeditionShopPresentation } from './ExpeditionEconomy.js';
import { expeditionQuestPresentations } from './ExpeditionQuestLedger.js';
import { deriveExpeditionStats, expeditionPowerRating } from './ExpeditionStats.js';
import { resolveExpeditionWeather } from './ExpeditionWeather.js';
import { decorateExpeditionLocations } from './ExpeditionWorld.js';

export function createExpeditionSnapshot(profile, maps) {
	const stats = deriveExpeditionStats(profile);
	const activeLocation = expeditionLocation(profile.activeLocationId);
	const activeMap = maps.find(map => map.id === activeLocation?.mapId) || null;
	const shop = expeditionShopForLocation(activeLocation?.id);
	return {
		profile: structuredClone(profile),
		stats,
		powerRating: expeditionPowerRating(stats),
		locations: decorateExpeditionLocations(profile, maps),
		quests: expeditionQuestPresentations(profile),
		inventory: EXPEDITION_GEAR.filter(item => profile.inventory.includes(item.id)),
		materials: materialPresentations(profile),
		activeLocation,
		activeMap,
		weather: activeMap ? resolveExpeditionWeather(activeMap, profile) : null,
		boss: activeLocation ? expeditionBossForLocation(activeLocation.id) : null,
		citizens: activeLocation ? expeditionCitizenPresentations(profile, activeLocation.id) : [],
		shop: shop ? expeditionShopPresentation(profile, shop) : null,
		recipes: activeLocation ? expeditionRecipePresentations(profile, activeLocation.id) : []
	};
}

function materialPresentations(profile) {
	return EXPEDITION_MATERIALS.map(material => ({
		...material,
		quantity: Number(profile.materials?.[material.id] || 0)
	}));
}
