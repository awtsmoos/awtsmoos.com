// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHouseBubbleSystem.js
 * @description Builds terrain-aware household micro-environments as seven shared batches.
 * The Awtsmoos reveals history through useful objects; Awtsmoos.com gives every home a path,
 * held slope, water outlet, boundary, planting, stored warmth, and place to sit.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { CANONICAL_VILLAGE_HOUSES } from './CanonicalVillageHouses.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageDistrictIdentity } from './VillageDistrictIdentity.js';
import { appendHouseBubbleParts } from './VillageHouseBubbleParts.js';

export function createVillageHouseBubbleDefinitions(groundSampler, quality = 'high') {
	const collectors = createCollectors();
	const houses = selectedHouses(quality);
	houses.forEach((house, index) => appendHouseBubbleParts(
		collectors,
		house,
		groundSampler,
		villageDistrictIdentity(house.districtId),
		index
	));
	const definitions = createBatches(collectors);
	definitions.stats = bubbleStats(collectors, houses, definitions, quality);
	return definitions;
}

function createCollectors() {
	return {
		drainage: [],
		fences: [],
		firewood: [],
		furniture: [],
		gardens: [],
		retaining: [],
		thresholds: []
	};
}

function selectedHouses(quality) {
	const count = quality === 'low' ? 8 : quality === 'medium' ? 13 : 18;
	return CANONICAL_VILLAGE_HOUSES.slice(0, count);
}

function createBatches(c) {
	return [
		batch('house-thresholds', c.thresholds, '#827768', TEXTURE_URLS.stone.cobblestone, 'house-access-threshold', 1.1),
		batch('house-retaining-edges', c.retaining, '#716a60', TEXTURE_URLS.stone.stone1, 'house-retaining-edge', 1.5),
		batch('house-drainage', c.drainage, '#565b5d', TEXTURE_URLS.stone.cobblestone, 'house-drainage-channel', 0.7),
		batch('house-fences', c.fences, '#4c3524', TEXTURE_URLS.wood.bark1, 'house-fence', 0.8),
		batch('house-gardens', c.gardens, '#493a2c', TEXTURE_URLS.terrain.tilledSoil, 'house-garden-bed', 0.8),
		batch('house-firewood', c.firewood, '#5c3a22', TEXTURE_URLS.wood.bark1, 'house-firewood-stack', 0.55),
		batch('house-furniture', c.furniture, '#4a3324', TEXTURE_URLS.wood.planks1, 'house-bench', 0.7)
	].filter(Boolean);
}

function batch(id, boxes, color, textureUrl, part, tileWorld) {
	if (boxes.length === 0) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'canonical-house-bubble',
		part,
		texturePolicy: {
			role: part,
			shader: 'weathered-house-bubble',
			tileWorld
		},
		textureUrl
	});
}

function bubbleStats(c, houses, definitions, quality) {
	return {
		batches: definitions.length,
		drainageChannels: c.drainage.length,
		fencePieces: c.fences.length,
		firewoodPieces: c.firewood.length,
		furniturePieces: c.furniture.length,
		gardenBeds: c.gardens.length,
		houses: houses.length,
		quality,
		retainingEdges: c.retaining.length,
		thresholds: c.thresholds.length,
		totalDetails: Object.values(c).reduce((sum, list) => sum + list.length, 0)
	};
}
