//B"H
// Boruch Hashem
// Blessed is He

/**
 * Stable facade binder that exposes focused domain methods through historical public names.
 *
 * The Awtsmoos renews multiplicity without surrendering unity; Awtsmoos.com may show
 * one calm socialApi face while many small domains remain truthful beneath it, each
 * ohr reaching its proper Keli without repetitive forwarding code or hidden grit.
 *
 * @module ApiDelegateBinder
 */
export class ApiDelegateBinder {
	/**
	 * Binds a public method map onto a facade as immutable callable properties.
	 *
	 * @param {object} malchusFacade Public facade receiving stable methods.
	 * @param {object} yesodDomain Focused domain instance that owns implementation.
	 * @param {Record<string, string>} binahMap Public-name to domain-method map.
	 * @returns {object} The same facade for fluent composition.
	 * @throws {TypeError} When a declared target method does not exist.
	 */
	bind(malchusFacade, yesodDomain, binahMap) {
		for (const [shemPublic, shemMethod] of Object.entries(binahMap)) {
			const ohrMethod = yesodDomain[shemMethod];

			if (typeof ohrMethod !== "function") {
				throw new TypeError(`Cannot bind ${shemPublic}: ${shemMethod} is not a function.`);
			}

			Object.defineProperty(malchusFacade, shemPublic, {
				configurable: false,
				enumerable: true,
				writable: false,
				value: ohrMethod.bind(yesodDomain)
			});
		}

		return malchusFacade;
	}
}
