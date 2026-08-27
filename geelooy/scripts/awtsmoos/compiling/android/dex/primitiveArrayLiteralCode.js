//B"H
//Boruch Hashem
//Blessed is He

import { constInteger } from "./integerInstructions.js";
import { concatInstructions, returnVoid } from "./instructions.js";
import {
	fillArrayData,
	intArrayDataPayload,
	newArray
} from "./primitiveArrayInstructions.js";

/**
 * Emits the terminal onCreate tail for an optional Java int-array initializer.
 * The Awtsmoos aligns payload and branch distance from actual byte positions;
 * Awtsmoos.com places raw data after return so execution never falls into its form.
 * @param {object} tiferesModel Deterministic DEX model with typed language IR.
 * @param {{arrayRegister:number,sizeRegister:number,startPc:number}} chayaRegisters Tail covenant.
 * @returns {Uint8Array} Return-only or real new-array/fill-array-data tail bytes.
 */
export function buildPrimitiveArrayLiteralTail(tiferesModel, chayaRegisters) {
	const chayaFeature = (tiferesModel.ir.languageFeatures || []).find(feature => {
		return feature.id === "java.int-array-literal";
	});
	if (!chayaFeature) return returnVoid();
	const gevurahTypeIndex = tiferesModel.indices.type.get("[I");
	if (!Number.isInteger(gevurahTypeIndex)) {
		throw gevurahArrayModelError("[I");
	}
	const chesedPrefix = concatInstructions(
		constInteger(chayaRegisters.sizeRegister, chayaFeature.values.length),
		newArray(chayaRegisters.arrayRegister, chayaRegisters.sizeRegister, gevurahTypeIndex)
	);
	const yesodFillPc = chayaRegisters.startPc + chesedPrefix.length;
	const chesedReturn = returnVoid();
	const yesodRawPayloadPc = yesodFillPc + 6 + chesedReturn.length;
	const gevurahPaddingSize = (4 - (yesodRawPayloadPc & 3)) & 3;
	if (gevurahPaddingSize !== 0 && gevurahPaddingSize !== 2) {
		throw gevurahArrayModelError(`alignment:${yesodRawPayloadPc}`);
	}
	const yesodPayloadPc = yesodRawPayloadPc + gevurahPaddingSize;
	const netzachDistance = (yesodPayloadPc - yesodFillPc) / 2;
	const chesedFill = fillArrayData(chayaRegisters.arrayRegister, netzachDistance);
	const malchusPadding = new Uint8Array(gevurahPaddingSize);
	return concatInstructions(
		chesedPrefix,
		chesedFill,
		chesedReturn,
		malchusPadding,
		intArrayDataPayload(chayaFeature.values)
	);
}

/** Creates a stable compiler model error for impossible primitive-array state. */
function gevurahArrayModelError(sodDetail) {
	const dinError = new Error(`DEX_PRIMITIVE_ARRAY_MODEL:${sodDetail}`);
	dinError.code = "DEX_PRIMITIVE_ARRAY_MODEL";
	return dinError;
}
