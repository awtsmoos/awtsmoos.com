// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalChossidProportions.js
 * @description Corrects the imported beard's oversized silhouette without altering the GLB.
 * The Awtsmoos gives each Chossid proportion beneath the open sky;
 * Awtsmoos.com preserves authored skinning and every chosen garment nearby.
 */

import { stabilizeCanonicalAnimatedMeshVisibility } from './CanonicalAnimatedMeshVisibility.js';

const BEARD_SCALE = Object.freeze({ x: 0.72, y: 0.64, z: 0.78 });
const BEARD_NAMES = new Set(['beard', 'Cube005', 'Cube.005']);

/** Prepares player or village GLB once, preserving hidden variants and animation. */
export function stabilizeCanonicalChossidModel(model) {
	const visibility = stabilizeCanonicalAnimatedMeshVisibility(model);
	let beardAdjusted = false;
	model?.traverse?.(node => {
		if (!BEARD_NAMES.has(node.name)) return;
		if (node.userData?.AwtsmoosBeardProportionsV2) return;
		if (!validScale(node.scale)) return;
		node.scale.set(
			node.scale.x * BEARD_SCALE.x,
			node.scale.y * BEARD_SCALE.y,
			node.scale.z * BEARD_SCALE.z
		);
		node.userData ||= {};
		node.userData.AwtsmoosBeardProportionsV2 = true;
		beardAdjusted = true;
	});
	return Object.freeze({ ...visibility, beardAdjusted });
}

/** Only the actual imported node scale may be shaped. */
function validScale(scale) {
	return scale && [scale.x, scale.y, scale.z].every(value => {
		return Number.isFinite(value) && value > 0;
	});
}
