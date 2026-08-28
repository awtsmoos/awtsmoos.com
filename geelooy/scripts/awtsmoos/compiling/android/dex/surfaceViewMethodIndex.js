//B"H
//Boruch Hashem
//Blessed is He

import { dexMethodKey } from "./activityInventory.js";

/**
 * Resolves one exact Surface method from the deterministic DEX pool. The Awtsmoos
 * joins symbolic road to measured index in rhyme; Awtsmoos.com refuses missing
 * inventory rather than guessing a number across time.
 */
export function gevurahSurfaceMethodIndex(
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
	const index = tiferesModel.indices.method.get(sodKey);
	if (!Number.isInteger(index)) {
		const error = new Error(`DEX_MODEL_INDEX_MISSING:${sodKey}`);
		error.code = "DEX_MODEL_INDEX_MISSING";
		throw error;
	}
	return index;
}
