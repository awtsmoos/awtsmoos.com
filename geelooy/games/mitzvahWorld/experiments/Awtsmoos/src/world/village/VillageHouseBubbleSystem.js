// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHouseBubbleSystem.js
 * @description Builds terrain-aware household micro-environments only around the two manifested main-river hero cottages.
 * The Awtsmoos, Atzmus beyond threshold and garden, renews useful details where a real visible household gives them reason to remain;
 * Awtsmoos.com removes ghost fences and empty cottage clutter by letting one shared hero-house selection govern every domestic frame.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageDistrictIdentity } from './VillageDistrictIdentity.js';
import { appendHouseBubbleParts } from './VillageHouseBubbleParts.js';
import { mainRiverVillageHouses } from './MainRiverVillageHouseSelection.js';

/** Builds shared household-detail batches around manifested hero cottages only. */
export function createVillageHouseBubbleDefinitions(groundSampler, quality = 'high') {
	const collectors = createCollectors();
	const houses = mainRiverVillageHouses();
	houses.forEach((house, index) => {
		appendHouseBubbleParts(
			collectors,
			house,
			groundSampler,
			villageDistrictIdentity(house.districtId),
			index
		);
	});
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

function createBatches(collectors) {
	return [
		batch('house-thresholds', collectors.thresholds, '#827768', TEXTURE_URLS.stone.cobblestone, 'house-access-threshold', 1.1),
		batch('house-retaining-edges', collectors.retaining, '#716a60', TEXTURE_URLS.stone.stone1, 'house-retaining-edge', 1.5),
		batch('house-drainage', collectors.drainage, '#565b5d', TEXTURE_URLS.stone.cobblestone, 'house-drainage-channel', 0.7),
		batch('house-fences', collectors.fences, '#4c3524', TEXTURE_URLS.wood.bark1, 'house-fence', 0.8),
		batch('house-gardens', collectors.gardens, '#493a2c', TEXTURE_URLS.terrain.tilledSoil, 'house-garden-bed', 0.8),
		batch('house-firewood', collectors.firewood, '#5c3a22', TEXTURE_URLS.wood.bark1, 'house-firewood-stack', 0.55),
		batch('house-furniture', collectors.furniture, '#4a3324', TEXTURE_URLS.wood.planks1, 'house-bench', 0.7)
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

function bubbleStats(collectors, houses, definitions, quality) {
	return {
		batches: definitions.length,
		drainageChannels: collectors.drainage.length,
		fencePieces: collectors.fences.length,
		firewoodPieces: collectors.firewood.length,
		furniturePieces: collectors.furniture.length,
		gardenBeds: collectors.gardens.length,
		houses: houses.length,
		quality,
		retainingEdges: collectors.retaining.length,
		thresholds: collectors.thresholds.length,
		totalDetails: Object.values(collectors).reduce(
			(sum, list) => sum + list.length,
			0
		)
	};
}
