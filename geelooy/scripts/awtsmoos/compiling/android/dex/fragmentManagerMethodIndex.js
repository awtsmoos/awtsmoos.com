//B"H
//Boruch Hashem
//Blessed is He

import { dexMethodKey } from "./activityInventory.js";

/**
 * Resolves one exact Fragment framework method index from the deterministic model.
 * The Awtsmoos joins symbolic method meaning to one measured DEX pool location;
 * Awtsmoos.com keeps missing-method errors identical across all Fragment emitters.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Method name.
 * @param {string} sodReturnType Return descriptor.
 * @param {Array<string>} netzachParameters Ordered parameter descriptors.
 * @returns {number} Integer DEX method index.
 */
export function gevurahFragmentMethodIndex(
	tiferesModel,
	malchusClassType,
	sodName,
	sodReturnType,
	netzachParameters = []
) {
	const sodKey = dexMethodKey(
		malchusClassType,
		sodName,
		sodReturnType,
		netzachParameters
	);
	const gevurahIndex = tiferesModel.indices.method.get(sodKey);
	if (!Number.isInteger(gevurahIndex)) {
		const dinError = new Error(`DEX_MODEL_INDEX_MISSING:${sodKey}`);
		dinError.code = "DEX_MODEL_INDEX_MISSING";
		throw dinError;
	}
	return gevurahIndex;
}
