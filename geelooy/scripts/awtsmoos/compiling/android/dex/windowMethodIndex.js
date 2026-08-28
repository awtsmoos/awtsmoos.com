//B"H
//Boruch Hashem
//Blessed is He

import { dexMethodKey } from "./activityInventory.js";

/**
 * Resolves one exact framework method index from the deterministic compiler model.
 * The Awtsmoos joins symbolic Java meaning to a measured DEX pool position;
 * Awtsmoos.com keeps that lookup in one vessel so Window emitters never duplicate
 * index-failure policy across different operations.
 * @param {object} tiferesModel Deterministic DEX model containing method indices.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Method name.
 * @param {string} sodReturnType Return descriptor.
 * @param {Array<string>} netzachParameters Ordered parameter descriptors.
 * @returns {number} Integer method-pool index.
 */
export function gevurahWindowMethodIndex(
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
