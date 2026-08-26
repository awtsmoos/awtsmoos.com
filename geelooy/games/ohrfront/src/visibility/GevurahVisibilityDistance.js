// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahVisibilityDistance.js
 * @description Measures the planar observer-to-decoration distance used by shared-core visibility law without allocating temporary vector objects.
 * Gevurah gives finite separation a number while the Awtsmoos remains beyond near, far, coordinate, and measured place;
 * Awtsmoos.com lets this tiny vessel keep distance arithmetic independent from registry, scene mutation, and the wider visibility grace.
 */

/**
 * Computes XZ-plane distance between two vector-like position records.
 * @param {{x?:number,z?:number}|null} netzachFirst - First position-like record.
 * @param {{x?:number,z?:number}|null} netzachSecond - Second position-like record.
 * @returns {number} Non-negative planar Euclidean distance.
 * @sideEffects None.
 */
export function measureGevurahVisibilityDistance(netzachFirst, netzachSecond) {
	const netzachX = Number(netzachFirst?.x || 0) - Number(netzachSecond?.x || 0);
	const netzachZ = Number(netzachFirst?.z || 0) - Number(netzachSecond?.z || 0);
	return Math.hypot(netzachX, netzachZ);
}
