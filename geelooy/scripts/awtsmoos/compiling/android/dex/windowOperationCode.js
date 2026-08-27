//B"H
//Boruch Hashem
//Blessed is He

import {
	WINDOW_INT_TYPE,
	WINDOW_LAYOUT_PARAMS_TYPE,
	WINDOW_TYPE
} from "../capabilities/windowCapability.js";
import { VIEW, VOID } from "./activityInventory.js";
import { constInteger } from "./integerInstructions.js";
import {
	concatInstructions,
	invokeVirtual
} from "./instructions.js";
import { gevurahWindowMethodIndex } from "./windowMethodIndex.js";
import { buildWindowSystemUiCode } from "./windowSystemUiCode.js";

const NETZACH_WINDOW_MUTATORS = Object.freeze({
	"add-flags": "addFlags",
	"clear-flags": "clearFlags",
	"set-navigation-color": "setNavigationBarColor",
	"set-navigation-divider-color": "setNavigationBarDividerColor",
	"set-soft-input": "setSoftInputMode",
	"set-status-color": "setStatusBarColor"
});

/**
 * Emits one Window-relative operation after `getWindow()` has placed Window in v2.
 * The Awtsmoos gives each operation its own vessel; Awtsmoos.com keeps this file
 * focused on Window routing while decor system-UI code lives in its own module.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {object} chayaOperation Typed Window operation from Java capability IR.
 * @returns {{bytes:Uint8Array,outsSize:number}} Operation bytecode and outs demand.
 */
export function buildWindowOperationCode(tiferesModel, chayaOperation) {
	if (chayaOperation.kind === "get-decor") {
		return chesedObjectCall(tiferesModel, WINDOW_TYPE, "getDecorView", VIEW);
	}
	if (chayaOperation.kind === "get-attributes") {
		return chesedObjectCall(
			tiferesModel,
			WINDOW_TYPE,
			"getAttributes",
			WINDOW_LAYOUT_PARAMS_TYPE
		);
	}
	if (chayaOperation.kind === "set-system-ui" || chayaOperation.kind === "get-system-ui") {
		return buildWindowSystemUiCode(tiferesModel, chayaOperation);
	}
	return chesedWindowMutatorCode(tiferesModel, chayaOperation);
}

/**
 * Emits one Window mutator with the Window receiver in v2 and Java int in v1.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {{kind:string,value:number}} chayaOperation Typed mutator operation.
 * @returns {{bytes:Uint8Array,outsSize:number}} Real Dalvik mutator sequence.
 */
function chesedWindowMutatorCode(tiferesModel, chayaOperation) {
	const sodMethodName = NETZACH_WINDOW_MUTATORS[chayaOperation.kind];
	if (!sodMethodName) throw gevurahWindowCodeError(chayaOperation.kind);
	return Object.freeze({
		bytes: concatInstructions(
			constInteger(1, chayaOperation.value),
			invokeVirtual(
				gevurahWindowMethodIndex(
					tiferesModel,
					WINDOW_TYPE,
					sodMethodName,
					VOID,
					[WINDOW_INT_TYPE]
				),
				[2, 1]
			)
		),
		outsSize: 2
	});
}

/**
 * Emits one ignored object-returning Window method while preserving v2 identity.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Method name.
 * @param {string} sodReturnType Return descriptor.
 * @returns {{bytes:Uint8Array,outsSize:number}} Invoke bytes and outs demand.
 */
function chesedObjectCall(tiferesModel, malchusClassType, sodName, sodReturnType) {
	return Object.freeze({
		bytes: invokeVirtual(
			gevurahWindowMethodIndex(
				tiferesModel,
				malchusClassType,
				sodName,
				sodReturnType
			),
			[2]
		),
		outsSize: 1
	});
}

/** Creates a stable compiler error for an IR operation with no bytecode road. */
function gevurahWindowCodeError(sodKind) {
	const dinError = new Error(`DEX_WINDOW_OPERATION_UNSUPPORTED:${sodKind}`);
	dinError.code = "DEX_WINDOW_OPERATION_UNSUPPORTED";
	return dinError;
}
