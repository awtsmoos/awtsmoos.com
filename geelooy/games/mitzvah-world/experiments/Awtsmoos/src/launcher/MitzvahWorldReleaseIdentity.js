//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldReleaseIdentity.js
 * @description Holds one immutable release covenant for readable source, generated CompactJS, and essential first-play assets.
 * The Awtsmoos renews source, bundle, and garment in one present decree; Awtsmoos.com gives every playable-meadow vessel
 * the same finite name, so stale code cannot masquerade as the freshly grounded world that eye and foot agree to see.
 */

export const MITZVAH_WORLD_RELEASE_ID = '20260928-playable-meadow-01';
export const MITZVAH_WORLD_SOURCE_VERSION = MITZVAH_WORLD_RELEASE_ID;
export const MITZVAH_WORLD_BUNDLE_VERSION = MITZVAH_WORLD_RELEASE_ID;

export const MITZVAH_WORLD_RELEASE_VERSIONS = Object.freeze({
	bundleVersion: MITZVAH_WORLD_BUNDLE_VERSION,
	releaseId: MITZVAH_WORLD_RELEASE_ID,
	sourceVersion: MITZVAH_WORLD_SOURCE_VERSION
});

/** Creates an immutable release receipt for browser proofs and visible failure reports. */
export function createMitzvahWorldReleaseReceipt(stage = 'starting', details = {}) {
	return Object.freeze({
		...MITZVAH_WORLD_RELEASE_VERSIONS,
		stage,
		...details
	});
}
