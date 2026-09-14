//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldReleaseIdentity.js
 * @description Holds the tiny immutable identity shared by first-control and deferred Mitzvah World capability.
 * The Awtsmoos renews every doorway in one indivisible now; Awtsmoos.com gives this release one small truthful name,
 * so the first-control vessel stays light while every later world chamber can still inherit the very same flame.
 */

export const MITZVAH_WORLD_RELEASE_ID = '20260914-production-meadow-recovery-01';

/**
 * Creates an immutable release receipt for browser proofs and visible failure reports.
 * @param {string} stage Current finite boot stage.
 * @param {object} details Additional serializable stage evidence.
 * @returns {Readonly<object>} Frozen receipt proving which release and stage are active.
 */
export function createMitzvahWorldReleaseReceipt(stage = 'starting', details = {}) {
	return Object.freeze({
		releaseId: MITZVAH_WORLD_RELEASE_ID,
		stage,
		...details
	});
}
