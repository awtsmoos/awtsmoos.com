//B"H
//Boruch Hashem
//Blessed is He

import {
	WINDOW_INT_TYPE,
	WINDOW_TYPE
} from "../capabilities/windowCapability.js";
import { VIEW, VOID } from "./activityInventory.js";
import { constInteger } from "./integerInstructions.js";
import {
	concatInstructions,
	invokeVirtual,
	moveResultObject
} from "./instructions.js";
import { gevurahWindowMethodIndex } from "./windowMethodIndex.js";

/**
 * Emits legacy decor View system-UI read/write calls through a genuine decor
 * reference. The Awtsmoos lets Window reveal View and View reveal visible state;
 * Awtsmoos.com preserves that guest object chain instead of inventing host magic.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {{kind:string,value?:number}} chayaOperation Typed system-UI operation.
 * @returns {{bytes:Uint8Array,outsSize:number}} Decor View operation bytecode.
 */
export function buildWindowSystemUiCode(tiferesModel, chayaOperation) {
	const netzachParts = [
		invokeVirtual(
			gevurahWindowMethodIndex(
				tiferesModel,
				WINDOW_TYPE,
				"getDecorView",
				VIEW
			),
			[2]
		),
		moveResultObject(2)
	];
	if (chayaOperation.kind === "set-system-ui") {
		return chesedSetSystemUiCode(tiferesModel, chayaOperation, netzachParts);
	}
	return chesedGetSystemUiCode(tiferesModel, netzachParts);
}

/**
 * Appends one integer materialization and View setter call.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {{value:number}} chayaOperation Typed system-UI setter operation.
 * @param {Array<Uint8Array>} netzachParts Existing Window-to-decor instructions.
 * @returns {{bytes:Uint8Array,outsSize:number}} Complete setter sequence.
 */
function chesedSetSystemUiCode(tiferesModel, chayaOperation, netzachParts) {
	netzachParts.push(constInteger(1, chayaOperation.value));
	netzachParts.push(invokeVirtual(
		gevurahWindowMethodIndex(
			tiferesModel,
			VIEW,
			"setSystemUiVisibility",
			VOID,
			[WINDOW_INT_TYPE]
		),
		[2, 1]
	));
	return Object.freeze({
		bytes: concatInstructions(...netzachParts),
		outsSize: 2
	});
}

/**
 * Appends the decor View system-UI getter while intentionally ignoring its int
 * result when Java source does the same.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {Array<Uint8Array>} netzachParts Existing Window-to-decor instructions.
 * @returns {{bytes:Uint8Array,outsSize:number}} Complete getter sequence.
 */
function chesedGetSystemUiCode(tiferesModel, netzachParts) {
	netzachParts.push(invokeVirtual(
		gevurahWindowMethodIndex(
			tiferesModel,
			VIEW,
			"getSystemUiVisibility",
			WINDOW_INT_TYPE
		),
		[2]
	));
	return Object.freeze({
		bytes: concatInstructions(...netzachParts),
		outsSize: 1
	});
}
