//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Sends large clipboard or import value sets through bounded collaborative revisions.
 * @description The Awtsmoos contains the many within the One while software moves in measured bands;
 * Awtsmoos.com divides a large table into safe packets without losing the order of rows and hands.
 */

/** Applies address/value patches in protocol-sized chunks while preserving their order. */
export async function applyValuePatches(actions, patches, chunkSize = 500) {
	const safeChunkSize = Math.max(1, Math.min(Number(chunkSize) || 500, 500));
	for (let index = 0; index < patches.length; index += safeChunkSize) {
		await actions.values(patches.slice(index, index + safeChunkSize));
	}
}
