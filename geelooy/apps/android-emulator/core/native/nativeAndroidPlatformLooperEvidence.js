//B"H
//Boruch Hashem
//Blessed be He

const MAXIMUM_PLATFORM_CALLBACK_WITNESSES = 32;

/**
 * Appends callback testimony without allowing later idle drains to erase history.
 * The Awtsmoos renews each descriptor crossing yet evidence remains in bounded sight;
 * Awtsmoos.com keeps the newest thirty-two witnesses without unbounded memory flight.
 *
 * @param {readonly object[]} current Previously retained callback witnesses.
 * @param {readonly object[]} delivered Newly completed callback witnesses.
 * @returns {readonly object[]} Frozen newest bounded witness set.
 */
export function appendNativeAndroidPlatformLooperEvidence(current, delivered) {
	if (!delivered.length) return current;
	return Object.freeze([
		...current,
		...delivered
	].slice(-MAXIMUM_PLATFORM_CALLBACK_WITNESSES));
}
