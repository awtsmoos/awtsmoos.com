//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file LavaCoinFactory.js
 * @description Builds collectible lava-course coin vessels while delegating native hierarchy creation to Procedural Core.
 * Coin positions remain gameplay semantics; the shared Core owns renderer-native group allocation.
 */

import { createNativeWorldGroup } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createPrimitiveMesh } from '../Box3D.js';
import { lavaCoinData } from './LavaCourseDefinitions.js';
import { lavaTextureUrl } from './LavaMaterialDefinitions.js';

/**
 * Creates every deterministic collectible coin used by one LavaLevel instance.
 * @param {object} [assets={}] Optional hydrated gold image vessel.
 * @returns {object[]} Mutable collectible records with stable scene groups.
 */
export function createLavaCoins(assets = {}) {
	return lavaCoinData().map((record, index) => {
		return createLavaCoin(record, assets, index);
	});
}

/**
 * Creates one collectible coin record and its Core-owned scene group.
 * @param {[number, number, number, number]} record Coin x/y/z plus supporting floor height.
 * @param {object} assets Optional hydrated visual assets.
 * @param {number} index Zero-based collectible index.
 * @returns {object} Mutable coin state consumed by the LavaLevel runtime.
 */
function createLavaCoin([x, y, z, floorY], assets, index) {
	const group = createNativeWorldGroup({
		name: `long-gold-coin-${index + 1}`
	});
	group.add(createPrimitiveMesh({
		id: `gold-2-long-course-coin-${index + 1}`,
		shape: 'cylinder',
		color: '#ffd84a',
		mapImage: assets.goldImage || null,
		textureUrl: lavaTextureUrl(assets.goldImage),
		mapRepeat: [1, 1],
		solid: false,
		position: {
			x,
			y,
			z
		},
		radius: 0.48,
		height: 0.08,
		segments: 32,
		rotation: {
			x: Math.PI / 2
		}
	}));

	return {
		floorY,
		got: false,
		group,
		x,
		y,
		z
	};
}
