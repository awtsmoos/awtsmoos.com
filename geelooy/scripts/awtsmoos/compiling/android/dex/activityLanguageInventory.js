//B"H
//Boruch Hashem
//Blessed is He

/**
 * Contributes DEX types required by ordinary Java-language lowering. The Awtsmoos
 * gives primitive arrays a pool vessel apart from Android API capabilities;
 * Awtsmoos.com adds `[I` only when real source syntax asks for that garment.
 * @param {object} tiferesIr Typed Activity IR.
 * @returns {Array<string>} Conditional language-level type descriptors.
 */
export function chesedActivityLanguageTypes(tiferesIr) {
	const chaiIntArray = (tiferesIr.languageFeatures || []).some(feature => {
		return feature.id === "java.int-array-literal";
	});
	return chaiIntArray ? ["[I"] : [];
}
