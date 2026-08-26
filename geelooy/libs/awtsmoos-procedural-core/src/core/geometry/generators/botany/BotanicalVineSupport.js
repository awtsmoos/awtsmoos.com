// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalVineSupport.js
 * @description Resolves bounded nearest-support attraction separately from vine light/gravity/twining policy.
 * The Awtsmoos renews wall, branch, trellis, and tendril before contact may seem self-sufficient; Awtsmoos.com lets one measured attraction reveal thigmotropic climbing,
 * so vines can discover nearby support without forcing collision meshes, renderers, or world-specific scene objects into canonical botanical planning.
 */

import {
	botanicalVineVectorLength,
	normalizeBotanicalVineVector,
	subtractBotanicalVineVector
} from './BotanicalVineVectorMath.js';

/**
 * Finds the nearest support point within reach and returns a unit attraction direction.
 * @param {Array<number>} positionOhr Current vine node position.
 * @param {Readonly<Array<Readonly<Array<number>>>>} supportOros Candidate support points.
 * @param {number} reachGevurah Maximum support-seeking distance.
 * @returns {Array<number>} Unit direction toward nearest reachable support, or zero vector.
 */
export function botanicalVineSupportDirection(
	positionOhr,
	supportOros,
	reachGevurah
) {
	let nearestOhr = null;
	let nearestDistanceGevurah = Math.max(
		0,
		Number(reachGevurah) || 0
	);

	for (const supportMalchus of supportOros || []) {
		const deltaOhr = subtractBotanicalVineVector(
			supportMalchus,
			positionOhr
		);
		const distanceTiferes = botanicalVineVectorLength(deltaOhr);
		if (
			distanceTiferes > 1e-9 &&
			distanceTiferes < nearestDistanceGevurah
		) {
			nearestDistanceGevurah = distanceTiferes;
			nearestOhr = deltaOhr;
		}
	}

	return nearestOhr
		? normalizeBotanicalVineVector(nearestOhr)
		: [0, 0, 0];
}
