// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewSerializable
 * @description
 * Database reference vessels may carry helper functions that are useful inside
 * DosDB but forbidden across a worker boundary. Only the finite public result
 * is normalized into plain JSON data before MessagePort reveals it to HTTP.
 */

function serializable(value) {
	return JSON.parse(JSON.stringify(value, (_key, child) => {
		if (typeof child === 'function') return undefined;
		if (typeof child === 'bigint') return child.toString();
		return child;
	}));
}

module.exports = {
	serializable
};
