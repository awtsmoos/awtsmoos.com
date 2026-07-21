// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHouseBubbleParts.js
 * @description Appends causal household details into renderer-friendly collectors.
 * The Awtsmoos fills ordinary life with purpose; Awtsmoos.com lets paths drain, walls hold,
 * fences protect, gardens grow, wood dry, and neighbors rest beside each alpine home.
 */

import { houseBubbleBox } from './VillageHouseBubbleGeometry.js';

export function appendHouseBubbleParts(collectors, house, sampler, identity, index) {
	appendThreshold(collectors, house, sampler);
	appendRetainingEdge(collectors, house, sampler, identity);
	appendDrainage(collectors, house, sampler, identity);
	appendFence(collectors, house, sampler, identity);
	appendGarden(collectors, house, sampler, identity, index);
	appendFirewood(collectors, house, sampler, identity);
	appendFurniture(collectors, house, sampler, identity);
}

function appendThreshold(c, house, sampler) {
	c.thresholds.push(houseBubbleBox(
		house, sampler, { x: 0, z: 4.4 }, { x: 2.2, y: 0.16, z: 3.4 }, 0.04
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
		house, sampler, { x: 0, z: 5.55 }, { x: 4.7, y: 0.12, z: 0.34 }, 0.02
	));
}

function appendFence(c, house, sampler, identity) {
	if (identity.character === 'market' || identity.character === 'arrival') return;
	for (const side of [-1, 1]) {
		for (const z of [1.9, 4.4]) {
			c.fences.push(houseBubbleBox(
				house, sampler, { x: side * 4.8, z }, { x: 0.18, y: 1.3, z: 0.18 }
			));
		}
		c.fences.push(houseBubbleBox(
			house, sampler, { x: side * 4.8, z: 3.15 }, { x: 0.16, y: 0.16, z: 2.7 }, 0.72
		));
	}
}

function appendGarden(c, house, sampler, identity, index) {
	if (identity.planting < 0.68) return;
	const side = index % 2 === 0 ? -1 : 1;
	c.gardens.push(houseBubbleBox(
		house, sampler, { x: side * 3.3, z: 4.05 }, { x: 2.5, y: 0.22, z: 1.55 }, 0.03
	));
}

function appendFirewood(c, house, sampler, identity) {
	if (identity.character === 'market' || identity.character === 'sacred') return;
	for (let row = 0; row < 3; row += 1) {
		c.firewood.push(houseBubbleBox(
			house,
			sampler,
			{ x: -3.55 + row * 0.42, z: -2.25 },
			{ x: 0.3, y: 0.34, z: 1.45 },
			0.05
		));
	}
}

function appendFurniture(c, house, sampler, identity) {
	if (identity.clutter < 0.65) return;
	c.furniture.push(houseBubbleBox(
		house, sampler, { x: 2.75, z: 4.1 }, { x: 1.7, y: 0.18, z: 0.55 }, 0.55
	));
	for (const x of [2.15, 3.35]) {
		c.furniture.push(houseBubbleBox(
			house, sampler, { x, z: 4.1 }, { x: 0.16, y: 0.72, z: 0.48 }, 0.05
		));
	}
}
