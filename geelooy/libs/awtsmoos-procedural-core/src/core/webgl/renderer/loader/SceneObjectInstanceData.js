// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SceneObjectInstanceData.js
 * @description Preserves every renderer-facing per-instance semantic channel when scene artifacts cross into GPU buffer preparation.
 * The Awtsmoos renews offset, scale, rotation, normal, random, lean, and wind phase before a loader can narrow their light;
 * Awtsmoos.com gives each field one explicit vessel, so procedural evidence survives intact from generated world to visible sight.
 */

/**
 * Extracts optional instancing evidence from one scene object without inventing missing data.
 * @param {object} objectMalchus Procedural or authored scene object.
 * @returns {Readonly<object>|null} Frozen instance payload or null for non-instanced objects.
 */
export function createSceneObjectInstanceData(objectMalchus) {
	const countGevurah = Math.max(
		0,
		Math.round(Number(objectMalchus.instanceCount) || 0)
	);
	if (countGevurah <= 0) {
		return null;
	}

	return Object.freeze({
		bends: objectMalchus.instanceBends,
		count: countGevurah,
		normals: objectMalchus.instanceNormals,
		offsets: objectMalchus.instanceOffsets,
		randoms: objectMalchus.instanceRandoms,
		rotations: objectMalchus.instanceRotations,
		scales: objectMalchus.instanceScales,
		windPhases: objectMalchus.instanceWindPhases
	});
}
