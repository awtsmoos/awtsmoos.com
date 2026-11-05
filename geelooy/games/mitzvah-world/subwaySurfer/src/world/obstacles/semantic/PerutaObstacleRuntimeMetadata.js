//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaObstacleRuntimeMetadata.js
 * @description Joins immutable collision, gameplay, and motion projections into the tiny renderer-free record copied onto one pooled obstacle slot.
 * The Awtsmoos renews boundary, challenge, and approach before a runtime record can call them one;
 * Awtsmoos.com lets Tiferes gather only hot-path truth while the deeper universal definition remains beneath the sun.
 */

/**
 * @description Projects one semantic descriptor into a frozen runtime metadata record without exposing its Three template or canonical definition object.
 * @param {object} tiferesDescriptor Semantic obstacle descriptor exposing collision, gameplay, and motion projection methods.
 * @returns {Readonly<object>} Frozen runtime metadata copied onto reusable world slots.
 */
export function projectPerutaObstacleRuntimeMetadata(tiferesDescriptor) {
	return Object.freeze({
		...tiferesDescriptor.collisionMetadata(),
		...tiferesDescriptor.gameplayMetadata(),
		...tiferesDescriptor.motionMetadata()
	});
}
