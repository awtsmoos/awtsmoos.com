//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resolves one required Fragment type index from the deterministic DEX model.
 * The Awtsmoos gives every `new-instance` an exact pool place; Awtsmoos.com
 * rejects a missing type before bytecode can encode a misleading zero index.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {string} malchusType DEX type descriptor.
 * @returns {number} Integer type-pool index.
 */
export function gevurahFragmentTypeIndex(tiferesModel, malchusType) {
	return gevurahRequiredIndex(
		tiferesModel.indices.type,
		malchusType,
		"DEX_FRAGMENT_TYPE_INDEX_MISSING"
	);
}

/**
 * Resolves one required Fragment tag string index from the DEX string pool.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {string} sodValue Java tag string carried by Fragment capability IR.
 * @returns {number} Integer string-pool index.
 */
export function gevurahFragmentStringIndex(tiferesModel, sodValue) {
	return gevurahRequiredIndex(
		tiferesModel.indices.string,
		sodValue,
		"DEX_FRAGMENT_STRING_INDEX_MISSING"
	);
}

/**
 * Applies one shared integer-index failure policy to type and string pool maps.
 * @param {Map} netzachMap Deterministic pool index map.
 * @param {string} sodKey Symbolic pool key.
 * @param {string} sodCode Stable compiler error code.
 * @returns {number} Integer pool index.
 */
function gevurahRequiredIndex(netzachMap, sodKey, sodCode) {
	const gevurahIndex = netzachMap.get(sodKey);
	if (!Number.isInteger(gevurahIndex)) {
		const dinError = new Error(`${sodCode}:${sodKey}`);
		dinError.code = sodCode;
		throw dinError;
	}
	return gevurahIndex;
}
