// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeSystem.js
 * @description Creates BRIDGE01 as a restrained fieldstone crossing with one real arch opening and human-scale rails.
 * The Awtsmoos joins divided banks while the river remains visibly free beneath them; Awtsmoos.com keeps the finite bridge sturdy,
 * traversable, textured, and quiet enough that water and traveler remain the living subject instead of a fortress silhouette.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import {
	STONE_BRIDGE_DIMENSIONS,
	stoneBridgeDeckCenterY,
	stoneBridgeDeckTopY
} from './VillageStoneBridgeContract.js';
import { createStoneBridgeArchGeometry } from './VillageStoneBridgeGeometry.js';
import {
	createStoneBridgeAbutments,
	createStoneBridgeParapets
} from './VillageStoneBridgeMasonry.js';

export function createStoneBridgeDefinitions(center, groundSampler) {
	const groundY = villageGroundHeight(groundSampler, center.x, center.z);
	const deckY = stoneBridgeDeckCenterY(groundY);
	const springY = deckY - 5.95;
	return [
		archDefinition('front', center, springY, -2.12),
		archDefinition('rear', center, springY, 2.12),
		bridgeDeck(center, groundY, deckY),
		createStoneBridgeParapets(center, deckY),
		createStoneBridgeAbutments(center, groundY, deckY)
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
		texturePolicy: {
			publicFirebase: true,
			role: 'bridge-voussoir-masonry',
			shader: 'rough-stone-detail'
		},
		textureUrl: TEXTURE_URLS.bricks.fieldstone1,
		userData: {
			family: 'canonical-stone-bridge',
			landmarkId: 'BRIDGE01',
			part: 'arch-ring'
		}
	};
}

function bridgeDeck(center, groundY, deckY) {
	return {
		color: '#8b8275',
		id: 'Awtsmoos_BRIDGE01_deck',
		mapRepeat: [8, 3],
		position: { x: center.x, y: deckY, z: center.z },
		shape: 'box',
		size: {
			x: STONE_BRIDGE_DIMENSIONS.halfSpan * 2,
			y: STONE_BRIDGE_DIMENSIONS.deckThickness,
			z: STONE_BRIDGE_DIMENSIONS.width
		},
		solid: true,
		texturePolicy: {
			publicFirebase: true,
			role: 'bridge-crowned-stone-deck',
			shader: 'rough-stone-detail'
		},
		textureUrl: TEXTURE_URLS.stone.cobblestone,
		userData: {
			canonicalId: 'BRIDGE01',
			family: 'canonical-stone-bridge',
			landmarkId: 'BRIDGE01',
			part: 'deck',
			traversal: {
				approachAuthority: 'canonical-grade-solved-road',
				walkableSurfaceY: stoneBridgeDeckTopY(groundY)
			}
		}
	};
}
