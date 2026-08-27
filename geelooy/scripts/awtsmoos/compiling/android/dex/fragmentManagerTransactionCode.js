//B"H
//Boruch Hashem
//Blessed is He

import {
	FRAGMENT_MANAGER_TYPE,
	FRAGMENT_TRANSACTION_TYPE,
	FRAGMENT_TYPE
} from "../capabilities/fragmentManagerCapability.js";
import { STRING, VOID } from "./activityTypes.js";
import {
	concatInstructions,
	constString,
	invokeDirect,
	invokeVirtual,
	moveResultObject,
	newInstance
} from "./instructions.js";
import { gevurahFragmentMethodIndex } from "./fragmentManagerMethodIndex.js";
import {
	gevurahFragmentStringIndex,
	gevurahFragmentTypeIndex
} from "./fragmentManagerPoolIndex.js";

/**
 * Emits beginTransaction -> new Fragment -> add(tag) and optional commit through
 * genuine Dalvik instructions. The Awtsmoos carries manager, transaction,
 * Fragment, and tag as guest registers; Awtsmoos.com introduces no host shortcut.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {{tag:string,commit:boolean}} chayaOperation Typed add operation.
 * @param {{tagRegister:number,managerRegister:number,fragmentRegister:number}} chayaRegisters Scratch register covenant.
 * @returns {{bytes:Uint8Array,outsSize:number}} Real Fragment transaction bytecode.
 */
export function buildFragmentAddTransactionCode(
	tiferesModel,
	chayaOperation,
	chayaRegisters
) {
	const { tagRegister, managerRegister, fragmentRegister } = chayaRegisters;
	const netzachParts = [
		invokeVirtual(
			gevurahFragmentMethodIndex(
				tiferesModel,
				FRAGMENT_MANAGER_TYPE,
				"beginTransaction",
				FRAGMENT_TRANSACTION_TYPE
			),
			[managerRegister]
		),
		moveResultObject(managerRegister),
		newInstance(
			fragmentRegister,
			gevurahFragmentTypeIndex(tiferesModel, FRAGMENT_TYPE)
		),
		invokeDirect(
			gevurahFragmentMethodIndex(
				tiferesModel,
				FRAGMENT_TYPE,
				"<init>",
				VOID
			),
			[fragmentRegister]
		),
		constString(
			tagRegister,
			gevurahFragmentStringIndex(tiferesModel, chayaOperation.tag)
		),
		invokeVirtual(
			gevurahFragmentMethodIndex(
				tiferesModel,
				FRAGMENT_TRANSACTION_TYPE,
				"add",
				FRAGMENT_TRANSACTION_TYPE,
				[FRAGMENT_TYPE, STRING]
			),
			[managerRegister, fragmentRegister, tagRegister]
		),
		moveResultObject(managerRegister)
	];
	if (chayaOperation.commit) {
		netzachParts.push(invokeVirtual(
			gevurahFragmentMethodIndex(
				tiferesModel,
				FRAGMENT_TRANSACTION_TYPE,
				"commit",
				"I"
			),
			[managerRegister]
		));
	}
	return Object.freeze({
		bytes: concatInstructions(...netzachParts),
		outsSize: 3
	});
}
