// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStoneBridgeSystem.js
 * @description Creates BRIDGE01 as a restrained fieldstone crossing whose center deck span is genuinely missing until restored.
 * The Awtsmoos joins divided banks while leaving one earned place for repair; Awtsmoos.com keeps arch, abutments,
 * parapets, native deck segments, and later Creator restoration free of duplicate geometry or overlapping deck collision.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { stoneBridgeDeckCenterY } from './VillageStoneBridgeContract.js';
import { createStoneBridgeDeckSegments } from './VillageStoneBridgeDeck.js';
import { createStoneBridgeArchGeometry } from './VillageStoneBridgeGeometry.js';
import {
	createStoneBridgeAbutments,
	createStoneBridgeParapets
} from './VillageStoneBridgeMasonry.js';

/** Returns complete native bridge geometry while intentionally omitting the repair span. */
export function createStoneBridgeDefinitions(center, groundSampler) {
	const groundY = villageGroundHeight(groundSampler, center.x, center.z);
	const deckY = stoneBridgeDeckCenterY(groundY);
	const springY = deckY - 5.95;
	return [
		archDefinition('front', center, springY, -2.12),
		archDefinition('rear', center, springY, 2.12),
		...createStoneBridgeDeckSegments(center, deckY),
		createStoneBridgeParapets(center, deckY),
		createStoneBridgeAbutments(center, groundY, deckY)
	];
}

/** Creates one textured arch ring definition while preserving the river opening. */
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
