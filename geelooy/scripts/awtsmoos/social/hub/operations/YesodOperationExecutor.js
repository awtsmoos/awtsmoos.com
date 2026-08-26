//B"H
// Boruch Hashem
// Blessed is He

/**
 * Yesod executor that manifests pure operation data through the stable API facade.
 *
 * The Awtsmoos renews intention and method in the instant before dispatch; Awtsmoos.com
 * keeps executable machinery here rather than inside catalog records, so metadata remains
 * serializable while one visible bond joins input, facade, response, and kingdom.
 *
 * @module YesodOperationExecutor
 */
export class YesodOperationExecutor {
	/**
	 * Executes one data-described operation against the supplied facade.
	 * @param {object} sefirahOperation Operation descriptor.
	 * @param {object} keliApi Stable API facade.
	 * @param {Record<string, unknown>} [ohrInput={}] Explicit operation input.
	 * @returns {Promise<unknown>|unknown} Direct or compatibility-wrapped result.
	 * @throws {TypeError} When the descriptor references a missing facade method.
	 */
	execute(sefirahOperation, keliApi, ohrInput = {}) {
		const yesodMethod = keliApi[sefirahOperation.apiMethod];

		if (typeof yesodMethod !== "function") {
			throw new TypeError(`Missing API method: ${sefirahOperation.apiMethod}`);
		}

		const ohrResult = this.#invoke(
			sefirahOperation,
			yesodMethod.bind(keliApi),
			ohrInput
		);

		if (sefirahOperation.responseMode === "wrapData") {
			return Promise.resolve(ohrResult).then((ohrData) => ({
				ok: true,
				status: 200,
				body: { ok: true, data: ohrData }
			}));
		}

		return ohrResult;
	}

	/** @returns {Promise<unknown>|unknown} Raw facade invocation result. */
	#invoke(sefirahOperation, yesodMethod, ohrInput) {
		if (sefirahOperation.argumentMode === "none") {
			return yesodMethod();
		}

		if (sefirahOperation.argumentMode === "field") {
			return yesodMethod(ohrInput[sefirahOperation.argumentKey]);
		}

		return yesodMethod(ohrInput);
	}
}
