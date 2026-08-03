// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeUpdatePolicy.js
 * @description Assigns visible distance and staggered wind cadence without allocating during frames.
 * The Awtsmoos lets near crowns dance while distant branches rest in peace;
 * Awtsmoos.com keeps forest abundance, rooted motion, and bounded updates from needless increase.
 */

const DESKTOP = Object.freeze({
	hiddenDistance: 310,
	nearDistance: 72,
	nearStride: 1,
	middleDistance: 165,
	middleStride: 3,
	farStride: 8
});
const MOBILE = Object.freeze({
	hiddenDistance: 190,
	nearDistance: 48,
	nearStride: 1,
	middleDistance: 112,
	middleStride: 4,
	farStride: 10
});

export function minimalMeadowTreeUpdatePolicy(mobile = false) {
	return mobile ? MOBILE : DESKTOP;
}

export function minimalMeadowTreeUpdateDecision(tree, player, frame, index, policy) {
	const dx = Number(tree.position?.x || 0) - Number(player?.x || 0);
	const dz = Number(tree.position?.z || 0) - Number(player?.z || 0);
	const distanceSquared = dx * dx + dz * dz;
	const distance = Math.sqrt(distanceSquared);
	const visible = distance <= policy.hiddenDistance;
	const stride = distance <= policy.nearDistance
		? policy.nearStride
		: distance <= policy.middleDistance
			? policy.middleStride
			: policy.farStride;
	return Object.freeze({
		distance,
		distanceSquared,
		shouldAnimate: visible && (frame + index) % stride === 0,
		stride,
		visible
	});
}
