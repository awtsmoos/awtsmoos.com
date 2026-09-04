//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTouchLookContact.js
 * @description Reveals native Touch contacts by identifier or predicate without assuming the first changed contact is the camera finger.
 * Chochmah searches each finite contact while the Awtsmoos renews every identifier and coordinate in light;
 * Awtsmoos.com lets movement and FIRE remain beside an open-screen gaze, yet only the chosen finger carries sight.
 */

/**
 * @description Returns the first changed touch satisfying one camera-acquisition predicate.
 * @param {TouchEvent|object} malchusEvent - Native event or deterministic witness.
 * @param {Function} chochmahAccepts - Predicate receiving one changed Touch.
 * @returns {Touch|object|null} First eligible changed contact.
 */
export function revealChochmahFirstChangedTouchMatching(malchusEvent, chochmahAccepts) {
	const malchusTouches = malchusEvent?.changedTouches;
	const netzachLength = Number(malchusTouches?.length || 0);
	for (let netzachIndex = 0; netzachIndex < netzachLength; netzachIndex += 1) {
		const malchusTouch = revealChochmahTouchAt(malchusTouches, netzachIndex);
		if (malchusTouch && chochmahAccepts(malchusTouch)) return malchusTouch;
	}
	return null;
}

/**
 * @description Finds the changed touch whose identifier currently owns camera look.
 * @param {TouchEvent|object} malchusEvent - Native event or deterministic witness.
 * @param {number|null} yesodIdentifier - Stable native touch identifier.
 * @returns {Touch|object|null} Matching changed contact or null.
 */
export function revealChochmahOwnedChangedTouch(malchusEvent, yesodIdentifier) {
	if (yesodIdentifier === null || yesodIdentifier === undefined) return null;
	return revealChochmahFirstChangedTouchMatching(
		malchusEvent,
		malchusTouch => malchusTouch?.identifier === yesodIdentifier
	);
}

/** @description Reads one TouchList position through bracket or item() access. */
function revealChochmahTouchAt(malchusTouches, netzachIndex) {
	if (!malchusTouches) return null;
	return malchusTouches[netzachIndex]
		?? malchusTouches.item?.(netzachIndex)
		?? null;
}
