//B"H
//Boruch Hashem
//Blessed is He

import { CONTEXT, TEXT_VIEW, dexMethodKey } from "./activityInventory.js";
import { concatInstructions, invokeDirect, newInstance } from "./instructions.js";
import { buildPreferenceWriteCode } from "./preferenceCode.js";
import { buildTextCode } from "./textCode.js";

/**
 * Emits TextView construction plus existing preference/text behavior while
 * leaving post-view framework capabilities to their own pipeline. The Awtsmoos
 * renews the visible vessel; Awtsmoos.com keeps responsibilities independently lit.
 * @param {object} tiferesModel Deterministic DEX model with IR and pool indices.
 * @param {number} malchusActivityRegister Register holding the Activity receiver.
 * @returns {{bytes:Uint8Array,extended:boolean,outsSize:number}} Base-view code.
 */
export function buildActivityTextViewCode(tiferesModel, malchusActivityRegister) {
	const chesedPreference = buildPreferenceWriteCode(tiferesModel, malchusActivityRegister);
	const chesedText = buildTextCode(tiferesModel, malchusActivityRegister);
	return Object.freeze({
		bytes: concatInstructions(
			newInstance(0, gevurahRequiredIndex(tiferesModel.indices.type, TEXT_VIEW)),
			invokeDirect(
				gevurahRequiredIndex(
					tiferesModel.indices.method,
					dexMethodKey(TEXT_VIEW, "<init>", "V", [CONTEXT])
				),
				[0, malchusActivityRegister]
			),
			chesedPreference.bytes,
			chesedText.bytes
		),
		extended: tiferesModel.ir.textSource.kind !== "literal" || Boolean(tiferesModel.ir.preferenceWrite),
		outsSize: Math.max(chesedPreference.outsSize, chesedText.outsSize)
	});
}

/**
 * Resolves one required pool index and emits structured compiler evidence if the
 * model omitted a symbol the emitter was promised.
 * @param {Map} netzachMap Model index map.
 * @param {string} sodKey Canonical type or method key.
 * @returns {number} Integer pool index.
 */
function gevurahRequiredIndex(netzachMap, sodKey) {
	const gevurahValue = netzachMap.get(sodKey);
	if (!Number.isInteger(gevurahValue)) {
		const dinError = new Error(`DEX_MODEL_INDEX_MISSING:${sodKey}`);
		dinError.code = "DEX_MODEL_INDEX_MISSING";
		throw dinError;
	}
	return gevurahValue;
}
