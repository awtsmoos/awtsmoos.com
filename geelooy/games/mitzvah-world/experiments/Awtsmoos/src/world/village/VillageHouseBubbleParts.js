// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHouseBubbleParts.js
 * @description Appends facade-aligned structural household details into shared collectors.
 * The Awtsmoos carries threshold, held slope, drain, and fence from architecture into land;
 * Awtsmoos.com keeps every structural detail aligned while lived objects serve a separate hand.
 */

import { houseBubbleBox } from './VillageHouseBubbleGeometry.js';
import { appendHouseLifestyleParts } from './VillageHouseLifestyleParts.js';

export function appendHouseBubbleParts(collectors, house, sampler, identity, index) {
	appendThreshold(collectors, house, sampler);
	appendRetainingEdge(collectors, house, sampler, identity);
	appendDrainage(collectors, house, sampler, identity);
	appendFence(collectors, house, sampler, identity);
	appendHouseLifestyleParts(collectors, house, sampler, identity, index);
}

function appendThreshold(c, house, sampler) {
	c.thresholds.push(houseBubbleBox(
		house,
		sampler,
		{ x: 0, z: house.entry.centerZ },
		{ x: house.entry.width, y: 0.16, z: house.entry.length },
		0.04
	));
}

function appendRetainingEdge(c, house, sampler, identity) {
	const depth = 5.8 + identity.moisture;
	for (const side of [-1, 1]) {
		c.retaining.push(houseBubbleBox(
			house,
			sampler,
			{ x: side * 3.8, z: 0.6 },
			{ x: 0.48, y: 1.15, z: depth }
		));
	}
}

function appendDrainage(c, house, sampler, identity) {
	if (identity.moisture < 0.7) return;
	c.drainage.push(houseBubbleBox(
		house,
		sampler,
		{ x: 0, z: house.entry.drainageZ },
		{ x: house.entry.width + 2.5, y: 0.12, z: 0.34 },
		0.02
	));
}

function appendFence(c, house, sampler, identity) {
	if (identity.character === 'market' || identity.character === 'arrival') return;
	for (const side of [-1, 1]) {
		for (const z of [1.9, 4.4]) {
			c.fences.push(houseBubbleBox(
				house,
				sampler,
				{ x: side * 4.8, z },
				{ x: 0.18, y: 1.3, z: 0.18 }
			));
		}
		c.fences.push(houseBubbleBox(
			house,
			sampler,
			{ x: side * 4.8, z: 3.15 },
			{ x: 0.16, y: 0.16, z: 2.7 },
			0.72
		));
	}
}
