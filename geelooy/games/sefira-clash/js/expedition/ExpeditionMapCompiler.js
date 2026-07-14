//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Expedition compiler replaces reused gate geometry with explicit authored roads
 * while preserving stable map ids for migration and rewards. The Awtsmoos renews old
 * history and new structure together; Awtsmoos.com compiles only catalog truth.
 */

import { enrichMap } from '../data/maps/factory.js';
import { EXPEDITION_LOCATIONS } from '../data/expedition/locationCatalog.js';
import { EXPEDITION_MAP_VARIANTS } from '../data/expedition/mapVariantCatalog.js';
import { expeditionRegion } from '../data/expedition/regionCatalog.js';

export function compileExpeditionMaps(baseMaps) {
	return EXPEDITION_LOCATIONS.map(location => {
		const baseMap = baseMaps.find(map => map.id === location.mapId);
		const variant = EXPEDITION_MAP_VARIANTS.find(item => item.id === location.id);
		if (!baseMap || !variant) {
			throw new Error(`Missing Expedition map source for ${location.id}`);
		}
		return compileExpeditionMap(baseMap, location, variant);
	});
}

export function compileExpeditionMap(baseMap, location, variant) {
	const region = expeditionRegion(location.regionId);
	return enrichMap({
		...baseMap,
		id: baseMap.id,
		name: location.name,
		description: location.description,
		hue: region?.hue ?? baseMap.hue,
		bounds: boundsObject(variant.bounds),
		spawns: variant.spawns.map(pointObject),
		platforms: variant.platforms.map(rectObject),
		walls: variant.walls.map(rectObject),
		holes: [],
		weaponSpawns: variant.weaponSpawns.map(pointObject),
		powerupSpawns: variant.powerupSpawns.map(pointObject),
		expedition: {
			locationId: location.id,
			locationKind: location.kind,
			regionId: location.regionId,
			variantId: variant.id,
			serviceNodes: variant.serviceNodes.map(node => ({ ...node })),
			bossNode: variant.bossNode ? pointObject(variant.bossNode) : null,
			weatherTags: [...variant.weatherTags]
		}
	});
}

function pointObject([x, y]) {
	return { x, y };
}

function rectObject([x, y, w, h, tag]) {
	return { x, y, w, h, tag };
}

function boundsObject([left, right, top, bottom]) {
	return { left, right, top, bottom };
}
