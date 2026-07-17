// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeSystem.js
 * @description Creates BRIDGE01 with two arch rings, stone deck, parapets, and abutments.
 * The Awtsmoos joins divided banks without erasing the water between them; Awtsmoos.com
 * reveals a thick, weathered, traversable landmark whose silhouette reads before any label.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { createStoneBridgeArchGeometry } from './VillageStoneBridgeGeometry.js';

export function createStoneBridgeDefinitions(center, groundSampler) {
	const groundY = villageGroundHeight(groundSampler, center.x, center.z);
	const deckY = groundY + 3.25;
	const springY = deckY - 5.95;
	return [
		archDefinition('front', center, springY, -2.12),
		archDefinition('rear', center, springY, 2.12),
		bridgeDeck(center, deckY),
		parapetBatch(center, deckY),
		abutmentBatch(center, groundY, deckY)
	];
}

function archDefinition(side, center, springY, zOffset) {
	return {
		...createStoneBridgeArchGeometry(center, springY, zOffset),
		color: '#81786b',
		doubleSided: true,
		id: `Awtsmoos_BRIDGE01_arch_${side}`,
		mapRepeat: [7, 3],
		noEdge: true,
		shape: 'manual',
		solid: true,
		texturePolicy: { publicFirebase: true, role: 'bridge-voussoir-masonry', shader: 'rough-stone-detail' },
		textureUrl: TEXTURE_URLS.bricks.fieldstone1,
		userData: { family: 'canonical-stone-bridge', landmarkId: 'BRIDGE01', part: 'arch-ring' }
	};
}

function bridgeDeck(center, deckY) {
	return boxDefinition('deck', center.x, deckY, center.z, 15.2, 0.65, 5.2);
}

function parapetBatch(center, deckY) {
	const pieces = [];
	for (const side of [-1, 1]) {
		pieces.push(box(center.x, deckY + 0.85, center.z + side * 2.38, 15.2, 1.05, 0.48));
		for (let index = -3; index <= 3; index += 1) {
			pieces.push(box(center.x + index * 2.2, deckY + 1.25, center.z + side * 2.38, 0.6, 1.7, 0.6));
		}
	}
	return batchDefinition('parapets', pieces, 'parapet-and-post');
}

function abutmentBatch(center, groundY, deckY) {
	const pieces = [];
	for (const side of [-1, 1]) {
		pieces.push(box(center.x + side * 6.7, (groundY + deckY) / 2, center.z, 2.2, deckY - groundY + 1.6, 6.6));
		pieces.push(box(center.x + side * 8.1, deckY - 0.4, center.z, 2.1, 1.2, 6));
	}
	return batchDefinition('abutments', pieces, 'bank-abutment');
}

function boxDefinition(part, x, y, z, width, height, depth) {
	return {
		color: '#8b8275', id: `Awtsmoos_BRIDGE01_${part}`, mapRepeat: [7, 3],
		position: { x, y, z }, shape: 'box', size: { x: width, y: height, z: depth },
		solid: true, texturePolicy: { publicFirebase: true, role: 'bridge-crowned-stone-deck' },
		textureUrl: TEXTURE_URLS.stone.cobblestone, userData: { family: 'canonical-stone-bridge', landmarkId: 'BRIDGE01', part }
	};
}

function batchDefinition(part, pieces, role) {
	return createVillageBoxBatch(`BRIDGE01_${part}`, pieces, {
		color: '#7c7468', family: 'canonical-stone-bridge', part,
		texturePolicy: { role, shader: 'rough-stone-detail', tileWorld: 1.1 },
		textureUrl: TEXTURE_URLS.bricks.fieldstone1
	});
}

function box(x, y, z, width, height, depth) {
	return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw: 0 };
}
