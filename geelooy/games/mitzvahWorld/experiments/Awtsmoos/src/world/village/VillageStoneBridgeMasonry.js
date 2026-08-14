// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeMasonry.js
 * @description Shapes BRIDGE01's low parapets and bank shoulders without a fortress-like battlement silhouette.
 * The Awtsmoos joins two banks through quiet strength; Awtsmoos.com lets the finite masonry frame the river rather than dominate it,
 * preserving a human-scale crossing with continuous coping, modest end piers, and weathered fieldstone rooted into each shore.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';

export function createStoneBridgeParapets(center, deckY) {
	const pieces = [];
	for (const side of [-1, 1]) {
		const z = center.z + side * 2.38;
		pieces.push(box(center.x, deckY + 0.54, z, 15.2, 0.52, 0.38));
		pieces.push(box(center.x, deckY + 0.84, z, 15.35, 0.14, 0.52));
		for (const end of [-1, 1]) {
			pieces.push(box(center.x + end * 7.05, deckY + 0.66, z, 0.6, 0.82, 0.58));
		}
	}
	return masonryBatch('parapets', pieces, 'bridge-low-parapet');
}

export function createStoneBridgeAbutments(center, groundY, deckY) {
	const pieces = [];
	for (const side of [-1, 1]) {
		pieces.push(box(
			center.x + side * 6.85,
			(groundY + deckY) / 2,
			center.z,
			1.85,
			Math.max(1.4, deckY - groundY + 0.9),
			5.8
		));
		pieces.push(box(
			center.x + side * 7.85,
			deckY - 0.28,
			center.z,
			1.45,
			0.62,
			5.5
		));
	}
	return masonryBatch('abutments', pieces, 'bridge-bank-shoulder');
}

function masonryBatch(part, pieces, role) {
	return createVillageBoxBatch(`BRIDGE01_${part}`, pieces, {
		color: '#81796e',
		family: 'canonical-stone-bridge',
		part,
		texturePolicy: { role, shader: 'rough-stone-detail', tileWorld: 1.05 },
		textureUrl: TEXTURE_URLS.bricks.fieldstone1
	});
}

function box(x, y, z, width, height, depth) {
	return {
		position: { x, y, z },
		size: { x: width, y: height, z: depth },
		yaw: 0
	};
}
