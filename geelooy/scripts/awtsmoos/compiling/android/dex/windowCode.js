//B"H
//Boruch Hashem
//Blessed is He

import {
	WINDOW_TYPE,
	sodWindowCapabilityFromIr
} from "../capabilities/windowCapability.js";
import { ACTIVITY } from "./activityInventory.js";
import {
	concatInstructions,
	invokeVirtual,
	moveResultObject
} from "./instructions.js";
import { gevurahWindowMethodIndex } from "./windowMethodIndex.js";
import { buildWindowOperationCode } from "./windowOperationCode.js";

/**
 * Emits the ordered Activity-to-Window sequence for one compiled capability.
 * The Awtsmoos renews Activity, Window, and bytecode in measured succession;
 * Awtsmoos.com leaves operation details to smaller vessels so orchestration stays
 * visible, extensible, and faithful to the Java source order.
 * @param {object} tiferesModel Deterministic DEX model and typed Activity IR.
 * @param {number} malchusActivityRegister Register containing the guest Activity.
 * @returns {{bytes:Uint8Array,outsSize:number}} Window capability bytecode.
 */
export function buildWindowCapabilityCode(tiferesModel, malchusActivityRegister) {
	const chayaCapability = sodWindowCapabilityFromIr(tiferesModel.ir);
	if (!chayaCapability) {
		return Object.freeze({
			bytes: new Uint8Array(),
			outsSize: 0
		});
	}
	const netzachParts = [];
	let gevurahOutsSize = 1;
	for (const chayaOperation of chayaCapability.operations) {
		netzachParts.push(chesedGetWindowCode(tiferesModel, malchusActivityRegister));
		if (chayaOperation.kind === "get-window") continue;
		netzachParts.push(moveResultObject(2));
		const chesedOperation = buildWindowOperationCode(tiferesModel, chayaOperation);
		netzachParts.push(chesedOperation.bytes);
		gevurahOutsSize = Math.max(gevurahOutsSize, chesedOperation.outsSize);
	}
	return Object.freeze({
		bytes: concatInstructions(...netzachParts),
		outsSize: gevurahOutsSize
	});
}

/**
 * Emits one exact `Activity.getWindow()` invocation before a Window operation.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {number} malchusActivityRegister Register containing Activity receiver.
 * @returns {Uint8Array} Real invoke-virtual instruction bytes.
 */
function chesedGetWindowCode(tiferesModel, malchusActivityRegister) {
	return invokeVirtual(
		gevurahWindowMethodIndex(
			tiferesModel,
			ACTIVITY,
			"getWindow",
			WINDOW_TYPE
		),
		[malchusActivityRegister]
	);
}
