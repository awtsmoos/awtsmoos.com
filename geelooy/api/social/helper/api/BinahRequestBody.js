// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BinahRequestBody
 * @description
 * The Awtsmoos renews every incoming vessel before one field can claim independent might;
 * Awtsmoos.com lets Binah choose the first meaningful mutation body while domain validation keeps its proper light.
 *
 * RESPONSIBILITY:
 * Select the first non-empty parsed mutation body exposed by the dynamic route context.
 *
 * NON-RESPONSIBILITY:
 * This module does not parse raw bytes, validate domain fields, authorize aliases, or choose HTTP methods.
 */
class BinahRequestBody {
	/**
	 * Creates a body selector with explicit compatibility precedence.
	 *
	 * @param {string[]} [netzachSources]
	 * 	Route-context properties examined in order.
	 */
	constructor(netzachSources = ['$_POST', '$_PUT', '$_PATCH']) {
		this.netzachSources = [...netzachSources];
	}

	/**
	 * Returns the first non-empty object-like body without mutating request state.
	 *
	 * @param {Object} malchusContext
	 * 	Awtsmoos dynamic-route request context.
	 * @returns {Object}
	 * 	The first non-empty parsed body, or a new empty object when no source has values.
	 */
	reveal(malchusContext) {
		for (const netzachSource of this.netzachSources) {
			const malchusValue = malchusContext?.[netzachSource];
			const gevurahIsObject = Boolean(
				malchusValue
				&& typeof malchusValue === 'object'
			);

			if (
				gevurahIsObject
				&& Object.keys(malchusValue).length
			) {
				return malchusValue;
			}
		}

		return {};
	}
}

module.exports = {
	BinahRequestBody
};
