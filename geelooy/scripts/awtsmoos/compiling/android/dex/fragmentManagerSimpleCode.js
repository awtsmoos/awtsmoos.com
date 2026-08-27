//B"H
//Boruch Hashem
//Blessed is He

import {
	FRAGMENT_BOOLEAN_TYPE,
	FRAGMENT_MANAGER_TYPE,
	FRAGMENT_TRANSACTION_TYPE,
	FRAGMENT_TYPE
} from "../capabilities/fragmentManagerCapability.js";
import { STRING } from "./activityTypes.js";
import {
	concatInstructions,
	constString,
	invokeVirtual
} from "./instructions.js";
import { gevurahFragmentMethodIndex } from "./fragmentManagerMethodIndex.js";
import { gevurahFragmentStringIndex } from "./fragmentManagerPoolIndex.js";

/**
 * Emits one non-transaction-chain FragmentManager operation from manager scratch.
 * The Awtsmoos keeps simple begin/execute/find roads apart from orchestration;
 * Awtsmoos.com lets the top-level emitter remain a readable sequence machine.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {object} chayaOperation Typed Fragment operation.
 * @param {{managerRegister:number,tagRegister:number}} chayaRegisters Scratch registers.
 * @returns {{bytes:Uint8Array,outsSize:number}} Real Dalvik operation bytecode.
 */
export function buildFragmentManagerSimpleCode(
	tiferesModel,
	chayaOperation,
	chayaRegisters
) {
	if (chayaOperation.kind === "begin") {
		return chesedSimpleManagerCall(
			tiferesModel,
			chayaRegisters,
			"beginTransaction",
			FRAGMENT_TRANSACTION_TYPE
		);
	}
	if (chayaOperation.kind === "execute-pending") {
		return chesedSimpleManagerCall(
			tiferesModel,
			chayaRegisters,
			"executePendingTransactions",
			FRAGMENT_BOOLEAN_TYPE
		);
	}
	if (chayaOperation.kind === "find-tag") {
		return chesedFindByTagCode(tiferesModel, chayaOperation, chayaRegisters);
	}
	throw gevurahFragmentSimpleError(chayaOperation.kind);
}

/** Emits one no-argument manager invocation whose return value is ignored. */
function chesedSimpleManagerCall(tiferesModel, chayaRegisters, sodName, sodReturnType) {
	return Object.freeze({
		bytes: invokeVirtual(
			gevurahFragmentMethodIndex(
				tiferesModel,
				FRAGMENT_MANAGER_TYPE,
				sodName,
				sodReturnType
			),
			[chayaRegisters.managerRegister]
		),
		outsSize: 1
	});
}

/** Emits a real DEX tag literal plus findFragmentByTag(String). */
function chesedFindByTagCode(tiferesModel, chayaOperation, chayaRegisters) {
	return Object.freeze({
		bytes: concatInstructions(
			constString(
				chayaRegisters.tagRegister,
				gevurahFragmentStringIndex(tiferesModel, chayaOperation.tag)
			),
			invokeVirtual(
				gevurahFragmentMethodIndex(
					tiferesModel,
					FRAGMENT_MANAGER_TYPE,
					"findFragmentByTag",
					FRAGMENT_TYPE,
					[STRING]
				),
				[chayaRegisters.managerRegister, chayaRegisters.tagRegister]
			)
		),
		outsSize: 2
	});
}

/** Creates a stable compiler error for an unknown simple Fragment operation. */
function gevurahFragmentSimpleError(sodKind) {
	const dinError = new Error(`DEX_FRAGMENT_OPERATION_UNSUPPORTED:${sodKind}`);
	dinError.code = "DEX_FRAGMENT_OPERATION_UNSUPPORTED";
	return dinError;
}
