//B"H
//Boruch Hashem
//Blessed is He

import {
	FRAGMENT_MANAGER_TYPE,
	sodFragmentManagerCapabilityFromIr
} from "../capabilities/fragmentManagerCapability.js";
import { ACTIVITY } from "./activityTypes.js";
import {
	concatInstructions,
	invokeVirtual,
	moveResultObject
} from "./instructions.js";
import { gevurahFragmentMethodIndex } from "./fragmentManagerMethodIndex.js";
import { buildFragmentManagerSimpleCode } from "./fragmentManagerSimpleCode.js";
import { buildFragmentAddTransactionCode } from "./fragmentManagerTransactionCode.js";

/**
 * Emits ordered native FragmentManager capability bytecode from one Activity.
 * The Awtsmoos reveals manager state before every source operation;
 * Awtsmoos.com keeps orchestration separate from transaction and simple-call
 * mechanics so new roads cannot hide inside one swollen emitter.
 * @param {object} tiferesModel Deterministic DEX model and typed Activity IR.
 * @param {{activityRegister:number,tagRegister:number,managerRegister:number,fragmentRegister:number}} chayaRegisters Named scratch-register covenant.
 * @returns {{bytes:Uint8Array,outsSize:number}} Fragment capability bytecode.
 */
export function buildFragmentManagerCapabilityCode(tiferesModel, chayaRegisters) {
	const chayaCapability = sodFragmentManagerCapabilityFromIr(tiferesModel.ir);
	if (!chayaCapability) {
		return Object.freeze({ bytes: new Uint8Array(), outsSize: 0 });
	}
	const netzachParts = [];
	let gevurahOutsSize = 1;
	for (const chayaOperation of chayaCapability.operations) {
		netzachParts.push(chesedGetFragmentManagerCode(tiferesModel, chayaRegisters));
		if (chayaOperation.kind === "get-manager") continue;
		netzachParts.push(moveResultObject(chayaRegisters.managerRegister));
		const chesedOperation = chayaOperation.kind === "add-fragment"
			? buildFragmentAddTransactionCode(tiferesModel, chayaOperation, chayaRegisters)
			: buildFragmentManagerSimpleCode(tiferesModel, chayaOperation, chayaRegisters);
		netzachParts.push(chesedOperation.bytes);
		gevurahOutsSize = Math.max(gevurahOutsSize, chesedOperation.outsSize);
	}
	return Object.freeze({
		bytes: concatInstructions(...netzachParts),
		outsSize: gevurahOutsSize
	});
}

/**
 * Emits the common Activity.getFragmentManager() invocation used before each road.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {{activityRegister:number}} chayaRegisters Named Activity register.
 * @returns {Uint8Array} Real invoke-virtual bytes.
 */
function chesedGetFragmentManagerCode(tiferesModel, chayaRegisters) {
	return invokeVirtual(
		gevurahFragmentMethodIndex(
			tiferesModel,
			ACTIVITY,
			"getFragmentManager",
			FRAGMENT_MANAGER_TYPE
		),
		[chayaRegisters.activityRegister]
	);
}
