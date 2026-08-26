//B"H
// Boruch Hashem
// Blessed is He

/**
 * Binah adapter that translates mutable Observatory page context into explicit API input.
 *
 * The Awtsmoos renews hidden context before it becomes action; Awtsmoos.com keeps
 * browser state on this side of the boundary so agents and tests may call semantic
 * operations with plain data, never inheriting assumptions from the visible kingdom.
 *
 * @module BinahContextInputResolver
 */
export class BinahContextInputResolver {
	/**
	 * Resolves descriptor defaults, named adapter output, and direct context mappings.
	 * @param {object} sefirahOperation Data-only operation descriptor.
	 * @param {Record<string, unknown>} [malchusContext={}] Current UI context.
	 * @param {Record<string, Function>} [yesodHelpers={}] Existing context payload adapters.
	 * @returns {Record<string, unknown>} Explicit API input object.
	 * @throws {TypeError} When a descriptor names an unavailable context adapter.
	 */
	resolve(sefirahOperation, malchusContext = {}, yesodHelpers = {}) {
		const ohrInput = { ...sefirahOperation.defaults };

		if (sefirahOperation.contextAdapter) {
			Object.assign(
				ohrInput,
				this.#resolveAdapter(sefirahOperation, malchusContext, yesodHelpers)
			);
		}

		for (const [shemInput, shemContext] of Object.entries(sefirahOperation.contextMap)) {
			ohrInput[shemInput] = malchusContext[shemContext];
		}

		return ohrInput;
	}

	/** @returns {Record<string, unknown>} Adapter-produced operation input. */
	#resolveAdapter(sefirahOperation, malchusContext, yesodHelpers) {
		const yesodAdapter = yesodHelpers[sefirahOperation.contextAdapter];

		if (typeof yesodAdapter !== "function") {
			throw new TypeError(`Missing context adapter: ${sefirahOperation.contextAdapter}`);
		}

		return yesodAdapter(malchusContext);
	}
}
