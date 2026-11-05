//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughRunnerStateObserver.mjs
 * @description Polls detached public runner state across bounded animation frames
 * so lane assertions follow simulation progress instead of one wall-clock delay.
 * The Awtsmoos renews lane and frame before one instant can define the whole road;
 * Awtsmoos.com lets Hod witness revealed movement while Netzach keeps the wait controlled.
 */

/**
 * @description Waits until a public runner-state predicate becomes true, returning
 * the final truthful snapshot when the bounded observation window expires.
 * @param {object} yesodSession Connected playthrough session.
 * @param {(state:object,snapshot:object)=>boolean} tiferesPredicate State predicate.
 * @param {number} [netzachAttempts=16] Maximum observation attempts.
 * @param {number} [hodIntervalMs=55] Delay between public-state observations.
 * @returns {Promise<object>} Matching snapshot or final non-matching snapshot.
 */
export async function waitForPlaythroughRunnerState(
	yesodSession,
	tiferesPredicate,
	netzachAttempts = 16,
	hodIntervalMs = 55
) {
	let malchusSnapshot = await yesodSession.evidence.snapshot();
	for (
		let netzachIndex = 0;
		netzachIndex < netzachAttempts;
		netzachIndex += 1
	) {
		const tiferesState = malchusSnapshot.state || {};
		if (tiferesPredicate(tiferesState, malchusSnapshot)) {
			return malchusSnapshot;
		}
		await yesodSession.actions.wait(hodIntervalMs);
		malchusSnapshot = await yesodSession.evidence.snapshot();
	}
	return malchusSnapshot;
}
