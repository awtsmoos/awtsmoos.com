// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillagePedestrianWearSystem.js
 * @description Adds narrow shortcuts and threshold approaches worn by repeated village movement.
 * The Awtsmoos reveals paths where feet choose necessity over geometry; Awtsmoos.com preserves
 * those humble decisions as deterministic bands distinct from formal roads and public courtyards.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const SHORTCUTS = Object.freeze([
	segment([-24, 57], [-35, 45], 1.05),
	segment([-29, 52], [-26, 12], 0.95),
	segment([-38, 18], [-20, 24], 1.1),
	segment([-25, -30], [-18, -43], 0.9),
	segment([1, -31], [10, -52], 0.95),
	segment([34, -4], [42, 12], 0.9),
	segment([46, 33], [-9, 38], 1.05)
]);

const APPROACHES = Object.freeze([
	[-35, 45, 0.4], [-26, 12, -0.2], [-34, -24, 0.6], [43, 39, -0.7], [52, -42, 0.2]
]);

export function createVillagePedestrianWearDefinitions(groundSampler, quality = 'high') {
	const shortcuts = selected(SHORTCUTS, quality).map(item => routeBox(item, groundSampler));
	const approaches = selected(APPROACHES, quality).map(item => approachBox(item, groundSampler));
	const definitions = [
		batch('wear-foot-shortcuts', shortcuts, '#55483b', 'foot-shortcut'),
		batch('wear-threshold-approaches', approaches, '#625346', 'threshold-approach')
	];
	definitions.stats = {
		approaches: approaches.length,
		batches: definitions.length,
		quality,
		shortcuts: shortcuts.length
	};
	return definitions;
}

function routeBox(item, sampler) {
	const dx = item.to[0] - item.from[0];
	const dz = item.to[1] - item.from[1];
	const x = (item.from[0] + item.to[0]) / 2;
	const z = (item.from[1] + item.to[1]) / 2;
	return {
		position: { x, y: villageGroundHeight(sampler, x, z) + 0.025, z },
		size: { x: item.width, y: 0.05, z: Math.hypot(dx, dz) },
		yaw: Math.atan2(dx, dz)
	};
}

function approachBox(item, sampler) {
	const [x, z, yaw] = item;
	return {
		position: { x, y: villageGroundHeight(sampler, x, z) + 0.03, z },
		size: { x: 1.35, y: 0.06, z: 5.2 },
		yaw
	};
}

function batch(id, boxes, color, part) {
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'canonical-pedestrian-wear',
		part,
		texturePolicy: { role: part, shader: 'compacted-foot-wear', tileWorld: 0.8 },
		textureUrl: TEXTURE_URLS.terrain.dirt1
	});
}

function selected(items, quality) {
	const count = quality === 'low' ? 3 : quality === 'medium' ? 5 : items.length;
	return items.slice(0, count);
}

function segment(from, to, width) {
	return Object.freeze({ from: Object.freeze(from), to: Object.freeze(to), width });
}
