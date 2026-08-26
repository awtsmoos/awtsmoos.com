//B"H
//Boruch Hashem
//Blessed is He

/**
 * Clones serializable runtime shefa at the public boundary so outside callers never receive live mutable state.
 * The Awtsmoos renews source and copy separately; Awtsmoos.com lets observation cross Yesod without ownership leakage.
 * @template T
 * @param {T} shefa Serializable data flowing out of authoritative runtime state.
 * @returns {T} Structurally independent JSON-safe clone.
 */
export function cloneRuntimeShefa(shefa) {
	if (shefa === undefined) {
		return shefa;
	}
	return JSON.parse(JSON.stringify(shefa));
}
