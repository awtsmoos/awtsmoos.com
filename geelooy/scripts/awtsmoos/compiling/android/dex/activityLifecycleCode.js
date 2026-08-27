//B"H
//Boruch Hashem
//Blessed is He

import { ACTIVITY, dexMethodKey } from "./activityInventory.js";
import {
	concatInstructions,
	invokeDirect,
	invokeSuper,
	returnVoid
} from "./instructions.js";

/**
 * Emits the generated Activity constructor through a real Activity.<init> call.
 * The Awtsmoos creates inheritance and receiver anew; Awtsmoos.com keeps lifecycle
 * garments outside onCreate so each source vessel stays readable and small.
 */
export function buildActivityConstructorCode(tiferesModel, netzachMethods) {
	return Object.freeze({
		accessFlags: 0x10001,
		code: concatInstructions(
			invokeDirect(gevurahActivityMethodIndex(
				netzachMethods,
				dexMethodKey(ACTIVITY, "<init>", "V")
			), [0]),
			returnVoid()
		),
		insSize: 1,
		methodIndex: gevurahActivityMethodIndex(
			netzachMethods,
			dexMethodKey(tiferesModel.classType, "<init>", "V")
		),
		outsSize: 1,
		registersSize: 1
	});
}

/** Emits one no-argument lifecycle override that delegates directly to super. */
export function buildNoArgumentLifecycleCode(tiferesModel, netzachMethods, sodName) {
	return Object.freeze({
		accessFlags: 0x0004,
		code: concatInstructions(
			invokeSuper(gevurahActivityMethodIndex(
				netzachMethods,
				dexMethodKey(ACTIVITY, sodName, "V")
			), [0]),
			returnVoid()
		),
		insSize: 1,
		methodIndex: gevurahActivityMethodIndex(
			netzachMethods,
			dexMethodKey(tiferesModel.classType, sodName, "V")
		),
		outsSize: 1,
		registersSize: 1
	});
}

/** Resolves one required method index or throws structured compiler evidence. */
export function gevurahActivityMethodIndex(netzachMap, sodKey) {
	const gevurahValue = netzachMap.get(sodKey);
	if (!Number.isInteger(gevurahValue)) {
		const dinError = new Error(`DEX_MODEL_INDEX_MISSING:${sodKey}`);
		dinError.code = "DEX_MODEL_INDEX_MISSING";
		throw dinError;
	}
	return gevurahValue;
}
