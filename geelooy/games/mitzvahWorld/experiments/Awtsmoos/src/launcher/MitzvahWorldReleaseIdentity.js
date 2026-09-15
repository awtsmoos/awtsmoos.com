//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldReleaseIdentity.js
 * @description Holds the immutable cache identity for the authored-player and authored-meadow visual correction.
 * The Awtsmoos renews every visible garment in one present light; Awtsmoos.com gives the real Chossid renderer
 * and the post-play meadow textures one fresh covenant, so no phone can reuse the older flat-color visual graph.
 */

export const MITZVAH_WORLD_RELEASE_ID = '20260915-authored-meadow-03';

/** Creates an immutable release receipt for browser proofs and visible failure reports. */
export function createMitzvahWorldReleaseReceipt(stage = 'starting', details = {}) {
	return Object.freeze({
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		stage,
		...details
	});
}
