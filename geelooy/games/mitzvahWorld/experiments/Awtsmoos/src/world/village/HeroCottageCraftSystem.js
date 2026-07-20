// B"H
// Boruch Hashem
// Blessed is He

/** Adds shared porch, balcony, rail, and facade depth to the hero cottages. */
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { canonicalFoundationTopHeight } from './CanonicalFoundationSampling.js';
import { CANONICAL_VILLAGE_HOUSES } from './CanonicalVillageHouses.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { facadeBox } from './VillageCottageFacadeLayout.js';
import { villageCottageScalePolicy } from './VillageCottageScalePolicy.js';

export function createHeroCottageCraftDefinitions(groundSampler) {
	const decks = [];
	const rails = [];
	const posts = [];
	const canopies = [];
	CANONICAL_VILLAGE_HOUSES.slice(0, 12).forEach((house, index) => {
		appendCraft({ ...house, ...villageCottageScalePolicy('near', index), base: cottageBase(house, index, groundSampler) }, index, decks, rails, posts, canopies);
	});
	return [
		batch('hero-cottage-balcony-decks', decks, '#59402d', TEXTURE_URLS.wood.planks1, 'balcony-deck'),
		batch('hero-cottage-balcony-rails', rails, '#3e2a1d', TEXTURE_URLS.wood.oak3, 'balcony-rail'),
		batch('hero-cottage-porch-posts', posts, '#432d1e', TEXTURE_URLS.wood.oak3, 'porch-and-timber-post'),
		batch('hero-cottage-porch-canopies', canopies, '#494744', TEXTURE_URLS.roof.tile2, 'slate-porch-canopy')
	];
}

function cottageBase(house, index, sampler) {
	const scale = villageCottageScalePolicy('near', index);
	return canonicalFoundationTopHeight(house.id, sampler, house.x, house.z, {
		depth: scale.depth, width: scale.width, x: house.x, yaw: house.yaw, z: house.z
	});
}

function appendCraft(cottage, index, decks, rails, posts, canopies) {
	const balconyWidth = cottage.width * (index % 2 ? 0.48 : 0.6);
	const balconyY = cottage.storyHeight + 0.22;
	decks.push(facadeBox(cottage, 0, balconyY, cottage.depth * 0.61, balconyWidth, 0.24, 1.85));
	canopies.push(facadeBox(cottage, 0, 2.85, cottage.depth * 0.66, 3.8, 0.22, 2.05));
	for (const side of [-1, 1]) {
		posts.push(facadeBox(cottage, side * 1.55, 1.42, cottage.depth * 0.7, 0.2, 2.8, 0.2));
		posts.push(facadeBox(cottage, side * cottage.width * 0.46, cottage.wallHeight / 2, cottage.depth * 0.525, 0.22, cottage.wallHeight - 0.3, 0.22));
		rails.push(facadeBox(cottage, side * (balconyWidth / 2 - 0.12), balconyY + 0.62, cottage.depth * 0.78, 0.16, 1.1, 0.16));
	}
	rails.push(facadeBox(cottage, 0, balconyY + 0.98, cottage.depth * 0.78, balconyWidth, 0.16, 0.16));
	rails.push(facadeBox(cottage, 0, balconyY + 0.48, cottage.depth * 0.78, balconyWidth, 0.12, 0.12));
}

function batch(id, boxes, color, textureUrl, part) {
	return createVillageBoxBatch(id, boxes, {
		color, family: 'canonical-hero-cottage-craft', part,
		texturePolicy: { role: part, shader: 'weathered-cottage-detail', tileWorld: 0.9 }, textureUrl
	});
}
