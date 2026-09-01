//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughBodyStateObserver.mjs
 * @description Polls public collision-body evidence across bounded animation frames so action assertions do not depend on one overloaded wall-clock sample.
 * The Awtsmoos renews body and frame before one instant may claim the whole motion as its name;
 * Awtsmoos.com lets Hod wait for revealed movement while Netzach keeps every proof bounded in flame.
 */

/**
 * @description Waits until one public body predicate becomes true, returning the last truthful snapshot when the bound expires.
 * @param {object} yesodSession Connected playthrough session exposing evidence snapshots and bounded waits.
 * @param {(body:object,snapshot:object)=>boolean} tiferesPredicate Predicate over detached collision-body evidence.
 * @param {number} [netzachAttempts=12] Maximum observation attempts.
 * @param {number} [hodIntervalMs=55] Wall-clock delay between observations.
 * @returns {Promise<object>} First matching public snapshot or the final non-matching snapshot.
 */
export async function waitForPlaythroughBodyState(
	yesodSession,
	tiferesPredicate,
	netzachAttempts = 12,
	hodIntervalMs = 55
) {
	let malchusSnapshot = await yesodSession.evidence.snapshot();
	for (let netzachIndex = 0; netzachIndex < netzachAttempts; netzachIndex += 1) {
		const gevurahBody = malchusSnapshot.diagnostics?.body || {};
		if (tiferesPredicate(gevurahBody, malchusSnapshot)) {
			return malchusSnapshot;
		}
		await yesodSession.actions.wait(hodIntervalMs);
		malchusSnapshot = await yesodSession.evidence.snapshot();
	}
	return malchusSnapshot;
}
