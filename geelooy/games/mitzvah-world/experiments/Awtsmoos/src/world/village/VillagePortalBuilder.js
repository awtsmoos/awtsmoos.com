// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillagePortalBuilder.js
 * @description Builds PORTAL01 as a stone-ringed luminous threshold beside the waterfall.
 * The Awtsmoos transcends every boundary while creating the notion of passage; Awtsmoos.com
 * gives the portal a rocky terrace, textured ring, and moving-water garment without floating pieces.
 */

import { fullMaterialUrl } from '../../assets/PublicMaterialResolver.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { landmarkCylinder } from './VillageLandmarkPrimitive.js';

export function createPortalDefinitions(options) {
	const x = 56;
	const z = -49;
	const base = options.base;
	return [
		stoneRing(options, base, x, z),
		landmarkCylinder({
			canonicalId: 'PORTAL01',
			color: '#7369c9',
			height: 0.24,
			id: 'PORTAL01-surface',
			materialRole: 'stone',
			materials: options.materials,
			radius: 2.08,
			rotation: { x: Math.PI / 2, y: 0, z: 0 },
			solid: false,
			textureUrl: fullMaterialUrl('seamless water brighter'),
			x,
			y: base + 2.7,
			z: z + 0.08
		})
	];
}

function stoneRing(options, base, x, z) {
	const boxes = [];
	const segments = 16;
	for (let index = 0; index < segments; index += 1) {
		const angle = index / segments * Math.PI * 2;
		boxes.push({
			position: {
				x: x + Math.cos(angle) * 2.65,
				y: base + 2.7 + Math.sin(angle) * 2.65,
				z
			},
			size: { x: 0.85, y: 0.85, z: 0.8 },
			yaw: angle
		});
	}
	return createVillageBoxBatch('PORTAL01-stone-ring', boxes, {
		color: '#837a70',
		family: 'canonical-waterfall-portal',
		part: 'stone-ring',
		texturePolicy: options.materials.texturePolicy,
		textureUrl: options.materials.stone
	});
}
