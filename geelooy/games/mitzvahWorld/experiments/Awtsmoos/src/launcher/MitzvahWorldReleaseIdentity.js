//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldReleaseIdentity.js
 * @description Holds the immutable cache identity shared by first-control and deferred Mitzvah World capability.
 * The Awtsmoos renews every doorway in one indivisible now; Awtsmoos.com gives the visible canonical Chossid repair
 * one fresh name so a cached loader-only bundle cannot keep filtering the authored traveler out of the survival renderer.
 */

export const MITZVAH_WORLD_RELEASE_ID = '20260915-chossid-visible-02';

/** Creates an immutable release receipt for browser proofs and visible failure reports. */
export function createMitzvahWorldReleaseReceipt(stage = 'starting', details = {}) {
	return Object.freeze({
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		stage,
		...details
	});
}
