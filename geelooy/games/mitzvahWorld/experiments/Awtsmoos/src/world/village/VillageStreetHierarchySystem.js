// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStreetHierarchySystem.js
 * @description Makes main streets, neighborhood lanes, and courtyards visibly distinct.
 * The Awtsmoos leads from public gathering toward private threshold; Awtsmoos.com expresses
 * that inward journey through measured width, texture, direction, and terrain-grounded bands.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const ROUTES = Object.freeze([
	route('main', [-12, 14], [-35, 45], 4.8),
	route('main', [-12, 14], [-34, -24], 4.8),
	route('main', [-12, 14], [18, 7], 4.8),
	route('lane', [18, 7], [38, 4], 2.8),
	route('lane', [18, 7], [43, 39], 2.8),
	route('lane', [-34, -24], [-8, -36], 2.8),
	route('lane', [-8, -36], [18, -48], 2.8),
	route('lane', [38, 4], [52, -42], 2.8)
]);

const COURTYARDS = Object.freeze([
	[-35, 45, 7], [-26, 12, 8], [-34, -24, 7], [56, -49, 6], [43, 39, 6]
]);

export function createVillageStreetHierarchyDefinitions(groundSampler, quality = 'high') {
	const routes = selectedRoutes(quality);
	const main = routes.filter(item => item.kind === 'main').map(item => segmentBox(item, groundSampler));
	const lanes = routes.filter(item => item.kind === 'lane').map(item => segmentBox(item, groundSampler));
	const courtyards = selectedCourtyards(quality).map(item => courtyardBox(item, groundSampler));
	const definitions = [
		batch('street-main-bands', main, '#766958', TEXTURE_URLS.stone.floor2, 'main-street'),
		batch('street-neighborhood-lanes', lanes, '#655b4d', TEXTURE_URLS.stone.cobblestone, 'neighborhood-lane'),
		batch('street-courtyard-thresholds', courtyards, '#837564', TEXTURE_URLS.stone.floor1, 'courtyard-threshold')
	].filter(Boolean);
	definitions.stats = {
		batches: definitions.length,
		courtyards: courtyards.length,
		mainRoutes: main.length,
		neighborhoodRoutes: lanes.length,
		quality
	};
	return definitions;
}

function segmentBox(item, sampler) {
	const dx = item.to[0] - item.from[0];
	const dz = item.to[1] - item.from[1];
	const x = (item.from[0] + item.to[0]) / 2;
	const z = (item.from[1] + item.to[1]) / 2;
	return {
		position: { x, y: villageGroundHeight(sampler, x, z) + 0.035, z },
		size: { x: item.width, y: 0.07, z: Math.hypot(dx, dz) },
		yaw: Math.atan2(dx, dz)
	};
}

function courtyardBox(item, sampler) {
	const [x, z, diameter] = item;
	return {
		position: { x, y: villageGroundHeight(sampler, x, z) + 0.045, z },
		size: { x: diameter, y: 0.09, z: diameter * 0.72 },
		yaw: 0
	};
}

function batch(id, boxes, color, textureUrl, part) {
	if (boxes.length === 0) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'canonical-street-hierarchy',
		part,
		texturePolicy: { role: part, shader: 'terrain-worn-street', tileWorld: 1.1 },
		textureUrl
	});
}

function selectedRoutes(quality) {
	const count = quality === 'low' ? 4 : quality === 'medium' ? 6 : ROUTES.length;
	return ROUTES.slice(0, count);
}

function selectedCourtyards(quality) {
	const count = quality === 'low' ? 2 : quality === 'medium' ? 4 : COURTYARDS.length;
	return COURTYARDS.slice(0, count);
}

function route(kind, from, to, width) {
	return Object.freeze({ from: Object.freeze(from), kind, to: Object.freeze(to), width });
}
