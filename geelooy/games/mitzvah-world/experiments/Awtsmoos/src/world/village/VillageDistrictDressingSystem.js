// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictDressingSystem.js
 * @description Gives each district a visible economy through four shared practical batches.
 * The Awtsmoos clothes one valley in many callings; Awtsmoos.com lets learning, commerce,
 * farming, water, and mountain craft become readable before a single sign is consulted.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { VILLAGE_DISTRICTS } from './VillageDistrictCatalog.js';
import { villageDistrictIdentity } from './VillageDistrictIdentity.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export function createVillageDistrictDressingDefinitions(groundSampler, quality = 'high') {
	const collectors = { craft: [], farming: [], learning: [], market: [] };
	const districts = selectedDistricts(quality);
	districts.forEach((district, index) => appendDistrict(
		collectors,
		district,
		villageDistrictIdentity(district.id),
		groundSampler,
		index
	));
	const definitions = createBatches(collectors);
	definitions.stats = createStats(collectors, definitions, districts, quality);
	return definitions;
}

function appendDistrict(c, district, identity, sampler, index) {
	const [x, z] = district.center;
	const phase = district.phase + index * 0.37;
	if (identity.character === 'market') appendMarket(c.market, x, z, phase, sampler);
	if (identity.character === 'learning' || identity.character === 'sacred') {
		appendLearning(c.learning, x, z, phase, sampler);
	}
	if (identity.character.includes('agricultural') || identity.character.includes('garden')) {
		appendFarm(c.farming, x, z, phase, sampler);
	}
	if (identity.character.includes('riverside') || identity.character.includes('forest')) {
		appendCraft(c.craft, x, z, phase, sampler);
	}
}

function appendMarket(boxes, x, z, phase, sampler) {
	for (const offset of [-4, 0, 4]) {
		boxes.push(boxAt(x + offset, z + 3, 1.2, 2.4, 0.22, sampler, phase));
		boxes.push(boxAt(x + offset, z + 3, 2.8, 0.18, 0.18, sampler, phase));
	}
}

function appendLearning(boxes, x, z, phase, sampler) {
	for (let row = 0; row < 4; row += 1) {
		boxes.push(boxAt(x - 3 + row * 0.9, z + 2.5, 0.7, 0.18, 1.1, sampler, phase));
	}
}

function appendFarm(boxes, x, z, phase, sampler) {
	for (let row = -2; row <= 2; row += 1) {
		boxes.push(boxAt(x + row * 1.4, z + 2, 0.65, 0.16, 7.5, sampler, phase));
	}
}

function appendCraft(boxes, x, z, phase, sampler) {
	for (let stack = 0; stack < 3; stack += 1) {
		boxes.push(boxAt(x + 3.2, z - 2 + stack * 0.75, 1.5, 0.42, 0.45, sampler, phase));
	}
}

function boxAt(x, z, sizeX, sizeY, sizeZ, sampler, yaw) {
	return {
		position: { x, y: villageGroundHeight(sampler, x, z) + sizeY / 2 + 0.04, z },
		size: { x: sizeX, y: sizeY, z: sizeZ },
		yaw
	};
}

function createBatches(c) {
	return [
		batch('district-market-frames', c.market, '#725033', TEXTURE_URLS.wood.planks1, 'market-frames'),
		batch('district-learning-stacks', c.learning, '#6b4428', TEXTURE_URLS.wood.planks1, 'learning-stacks'),
		batch('district-farm-rows', c.farming, '#4b3927', TEXTURE_URLS.terrain.tilledSoil, 'farm-rows'),
		batch('district-craft-stacks', c.craft, '#5a402c', TEXTURE_URLS.wood.bark1, 'craft-stacks')
	].filter(Boolean);
}

function batch(id, boxes, color, textureUrl, part) {
	if (boxes.length === 0) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'canonical-district-dressing',
		part,
		texturePolicy: { role: part, shader: 'district-economy', tileWorld: 0.8 },
		textureUrl
	});
}

function selectedDistricts(quality) {
	const count = quality === 'low' ? 5 : quality === 'medium' ? 8 : 10;
	return VILLAGE_DISTRICTS.slice(0, count);
}

function createStats(c, definitions, districts, quality) {
	return {
		batches: definitions.length,
		details: Object.values(c).reduce((sum, items) => sum + items.length, 0),
		districts: districts.length,
		quality
	};
}
