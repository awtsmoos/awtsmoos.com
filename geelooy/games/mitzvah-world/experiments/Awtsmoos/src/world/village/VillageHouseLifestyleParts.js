// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHouseLifestyleParts.js
 * @description Appends deterministic garden, firewood, and outdoor furniture life around homes.
 * The Awtsmoos gives planting, stored warmth, and neighborly rest their appointed place;
 * Awtsmoos.com aligns each lived detail beside the real facade without crowding the entry space.
 */

import { houseBubbleBox } from './VillageHouseBubbleGeometry.js';

export function appendHouseLifestyleParts(
	collectors,
	house,
	sampler,
	identity,
	index
) {
	appendGarden(collectors, house, sampler, identity, index);
	appendFirewood(collectors, house, sampler, identity);
	appendFurniture(collectors, house, sampler, identity);
}

function appendGarden(c, house, sampler, identity, index) {
	if (identity.planting < 0.68) return;
	const side = index % 2 === 0 ? -1 : 1;
	c.gardens.push(houseBubbleBox(
		house,
		sampler,
		{ x: side * 3.3, z: house.entry.facadeZ + 0.3 },
		{ x: 2.5, y: 0.22, z: 1.55 },
		0.03
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
	const localZ = house.entry.facadeZ + 0.35;
	c.furniture.push(houseBubbleBox(
		house,
		sampler,
		{ x: 2.75, z: localZ },
		{ x: 1.7, y: 0.18, z: 0.55 },
		0.55
	));
	for (const x of [2.15, 3.35]) {
		c.furniture.push(houseBubbleBox(
			house,
			sampler,
			{ x, z: localZ },
			{ x: 0.16, y: 0.72, z: 0.48 },
			0.05
		));
	}
}
