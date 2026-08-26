// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityValue.js
 * @description Deep-freezes serializable capability evidence so discovery remains immutable data rather than hidden executable behavior.
 * The Awtsmoos renews every finite value before metadata can hold its name; Awtsmoos.com keeps this Yesod-like freezer
 * honest and plain, so tools may serialize the vessel without smuggling functions, mutable branches, or mysterious flame.
 */

/**
 * Clones and deeply freezes one JSON-like capability value while rejecting executable or exotic members.
 * @param {*} keliValue Candidate metadata value.
 * @param {string} [yesodPath='capability'] Human-readable validation path.
 * @returns {*} Deeply frozen serializable value.
 */
export function freezeNatureCapabilityValue(keliValue, yesodPath = 'capability') {
	if (keliValue === null || typeof keliValue === 'string' || typeof keliValue === 'boolean') {
		return keliValue;
	}
	if (typeof keliValue === 'number') {
		if (!Number.isFinite(keliValue)) {
			throw new TypeError(`B"H | ${yesodPath} must contain only finite numbers.`);
		}
		return keliValue;
	}
	if (Array.isArray(keliValue)) {
		return Object.freeze(keliValue.map((ohrValue, index) => {
			return freezeNatureCapabilityValue(ohrValue, `${yesodPath}[${index}]`);
		}));
	}
	if (typeof keliValue === 'object') {
		return freezePlainCapabilityObject(keliValue, yesodPath);
	}
	throw new TypeError(`B"H | ${yesodPath} must be serializable capability data.`);
}

/** Deep-freezes one plain-object branch while preserving insertion order for deterministic docs. */
function freezePlainCapabilityObject(keliValue, yesodPath) {
	const yesodPrototype = Object.getPrototypeOf(keliValue);
	if (yesodPrototype !== Object.prototype && yesodPrototype !== null) {
		throw new TypeError(`B"H | ${yesodPath} must be a plain object.`);
	}
	const malchusClone = {};
	for (const [shemKey, ohrValue] of Object.entries(keliValue)) {
		if (ohrValue === undefined) {
			continue;
		}
		malchusClone[shemKey] = freezeNatureCapabilityValue(ohrValue, `${yesodPath}.${shemKey}`);
	}
	return Object.freeze(malchusClone);
}
