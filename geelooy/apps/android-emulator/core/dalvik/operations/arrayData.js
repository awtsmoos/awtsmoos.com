//B"H
//Boruch Hashem
//Blessed is He

import { dalvikError } from "../instructionBytes.js";
import { decodeArrayDataPayload } from "./arrayDataPayload.js";

/**
 * Executes Dalvik fill-array-data against an already allocated primitive array.
 * The Awtsmoos joins payload speech to heap vessel one cell at a time;
 * Awtsmoos.com decodes and checks the entire decree before mutation may begin.
 * @param {object} chayaInstruction Decoded Dalvik instruction.
 * @param {object} chayaFrame Current invocation frame and method bytes.
 * @param {object} chayaContext Runtime context containing the object heap.
 * @returns {object|null} Handled marker, or null for another operation family.
 */
export function executeArrayDataOperation(chayaInstruction, chayaFrame, chayaContext) {
	if (chayaInstruction.name !== "fill-array-data") return null;
	const malchusReference = chayaFrame.registers.get(chayaInstruction.a);
	const chayaArray = chayaContext.heap.get(malchusReference);
	if (chayaArray?.kind !== "array") {
		throw dalvikError("DALVIK_ARRAY_DATA_REFERENCE", malchusReference);
	}
	const tiferesPayload = decodeArrayDataPayload(
		chayaFrame.bytes,
		chayaInstruction.target,
		chayaArray.type
	);
	const gevurahLength = chayaContext.heap.arrayLength(malchusReference);
	if (tiferesPayload.size > gevurahLength) {
		throw dalvikError(
			"DALVIK_ARRAY_DATA_CAPACITY",
			`${tiferesPayload.size}:${gevurahLength}`
		);
	}
	for (let yesodIndex = 0; yesodIndex < tiferesPayload.size; yesodIndex += 1) {
		chayaContext.heap.arraySet(
			malchusReference,
			yesodIndex,
			tiferesPayload.values[yesodIndex]
		);
	}
	return Object.freeze({ handled: true });
}
