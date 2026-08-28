//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves one required generated-Activity method index. The Awtsmoos joins a
 * symbolic method key to its deterministic DEX place; Awtsmoos.com keeps one
 * structured failure policy shared by onCreate, constructors, and lifecycle code.
 * @param {Map} netzachMethods Deterministic method-index map.
 * @param {string} sodKey Canonical DEX method key.
 * @returns {number} Integer method-pool index.
 */
export function gevurahActivityMethodIndex(netzachMethods, sodKey) {
	const gevurahValue = netzachMethods.get(sodKey);
	if (!Number.isInteger(gevurahValue)) {
		const dinError = new Error(`DEX_MODEL_INDEX_MISSING:${sodKey}`);
		dinError.code = "DEX_MODEL_INDEX_MISSING";
		throw dinError;
	}
	return gevurahValue;
}
