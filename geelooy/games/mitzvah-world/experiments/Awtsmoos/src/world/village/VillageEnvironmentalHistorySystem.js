// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageEnvironmentalHistorySystem.js
 * @description Reveals moisture, traffic, repair, and age through four deterministic batches.
 * The Awtsmoos creates every instant without erasing yesterday's trace; Awtsmoos.com lets moss,
 * wheel wear, braces, and repair stone narrate how the alpine village endured and was renewed.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { VILLAGE_DISTRICTS } from './VillageDistrictCatalog.js';
import { villageDistrictIdentity } from './VillageDistrictIdentity.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export function createVillageEnvironmentalHistoryDefinitions(groundSampler, quality = 'high') {
	const collectors = { braces: [], moss: [], repairs: [], wear: [] };
	const districts = selectedDistricts(quality);
	districts.forEach((district, index) => appendHistory(
		collectors,
		district,
		villageDistrictIdentity(district.id),
		groundSampler,
		index
	));
	const definitions = createBatches(collectors);
	definitions.stats = {
		batches: definitions.length,
		details: Object.values(collectors).reduce((sum, list) => sum + list.length, 0),
		districts: districts.length,
		quality
	};
	return definitions;
}

function appendHistory(c, district, identity, sampler, index) {
	const [x, z] = district.center;
	const yaw = district.phase + index * 0.19;
	if (identity.moisture >= 0.75) {
		c.moss.push(boxAt(x - 4, z - 3, 6.5, 0.09, 0.42, sampler, yaw));
	}
	if (district.landmarkId || identity.character === 'residential') {
		c.braces.push(boxAt(x + 4.2, z - 1.5, 0.24, 2.7, 0.24, sampler, yaw + 0.55));
	}
	if (identity.character === 'market' || identity.character.includes('agricultural')) {
		for (const side of [-1, 1]) {
			c.wear.push(boxAt(x + side * 1.1, z, 0.38, 0.055, 10, sampler, yaw));
		}
	}
	if (index % 2 === 0) {
		for (let stone = 0; stone < 3; stone += 1) {
			c.repairs.push(boxAt(x - 5 + stone * 0.8, z + 4, 0.7, 0.45, 0.55, sampler, yaw));
		}
	}
}

function boxAt(x, z, sizeX, sizeY, sizeZ, sampler, yaw) {
	return {
		position: { x, y: villageGroundHeight(sampler, x, z) + sizeY / 2 + 0.03, z },
		size: { x: sizeX, y: sizeY, z: sizeZ },
		yaw
	};
}

function createBatches(c) {
	return [
		batch('history-moss-seams', c.moss, '#4b5d38', TEXTURE_URLS.terrain.grass1, 'moss-seam'),
		batch('history-repair-braces', c.braces, '#59402d', TEXTURE_URLS.wood.bark1, 'repair-brace'),
		batch('history-wheel-wear', c.wear, '#4f4338', TEXTURE_URLS.terrain.dirt1, 'wheel-wear'),
		batch('history-repair-stone', c.repairs, '#777064', TEXTURE_URLS.stone.stone1, 'repair-stone')
	].filter(Boolean);
}

function batch(id, boxes, color, textureUrl, part) {
	if (boxes.length === 0) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'canonical-environmental-history',
		part,
		texturePolicy: { role: part, shader: 'weathered-history', tileWorld: 0.75 },
		textureUrl
	});
}

function selectedDistricts(quality) {
	const count = quality === 'low' ? 5 : quality === 'medium' ? 8 : 10;
	return VILLAGE_DISTRICTS.slice(0, count);
}
