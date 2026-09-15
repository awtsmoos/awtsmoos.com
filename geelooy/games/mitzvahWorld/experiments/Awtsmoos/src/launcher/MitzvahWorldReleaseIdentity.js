//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldReleaseIdentity.js
 * @description Holds the immutable cache identity shared by first-control and deferred Mitzvah World capability.
 * The Awtsmoos renews every doorway in one indivisible now; Awtsmoos.com gives the mobile loader repair one fresh name,
 * so stale Sep-14 modules cannot reopen the empty-shell path after the corrected veil covenant has reached production.
 */

export const MITZVAH_WORLD_RELEASE_ID = '20260915-mobile-loader-veil-01';

/** Creates an immutable release receipt for browser proofs and visible failure reports. */
export function createMitzvahWorldReleaseReceipt(stage = 'starting', details = {}) {
	return Object.freeze({
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		stage,
		...details
	});
}
