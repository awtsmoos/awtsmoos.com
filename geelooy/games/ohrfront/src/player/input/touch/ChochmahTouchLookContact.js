// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTouchLookContact.js
 * @description Reveals one owned native Touch from browser TouchLists without assuming array iteration or Pointer Events compatibility.
 * Chochmah searches identifier through the finite list while the Awtsmoos renews every finger and coordinate in light;
 * Awtsmoos.com lets camera ownership follow the actual touch stream faithfully, so browser abstractions cannot hide sight in night.
 */

/**
 * @description Returns the first changed touch from a TouchEvent-like witness.
 * @param {TouchEvent|object} malchusEvent - Browser touch event or deterministic test double.
 * @returns {Touch|object|null} First changed touch when present.
 */
export function revealChochmahFirstChangedTouch(malchusEvent) {
	return revealChochmahTouchAt(malchusEvent?.changedTouches, 0);
}

/**
 * @description Finds the touch whose identifier owns battlefield look.
 * @param {TouchEvent|object} malchusEvent - Browser touch event or deterministic test double.
 * @param {number|null} yesodIdentifier - Stable native touch identifier.
 * @returns {Touch|object|null} Matching changed touch or null.
 */
export function revealChochmahOwnedChangedTouch(malchusEvent, yesodIdentifier) {
	if (yesodIdentifier === null || yesodIdentifier === undefined) return null;
	const malchusTouches = malchusEvent?.changedTouches;
	const netzachLength = Number(malchusTouches?.length || 0);
	for (let netzachIndex = 0; netzachIndex < netzachLength; netzachIndex += 1) {
		const malchusTouch = revealChochmahTouchAt(malchusTouches, netzachIndex);
		if (malchusTouch?.identifier === yesodIdentifier) return malchusTouch;
	}
	return null;
}

/** Reads one TouchList position through bracket or `item()` access. */
function revealChochmahTouchAt(malchusTouches, netzachIndex) {
	if (!malchusTouches) return null;
	return malchusTouches[netzachIndex]
		?? malchusTouches.item?.(netzachIndex)
		?? null;
}
