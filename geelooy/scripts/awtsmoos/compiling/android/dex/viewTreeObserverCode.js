//B"H
//Boruch Hashem
//Blessed is He

import {
	VIEW_TREE_OBSERVER_BOOLEAN,
	VIEW_TREE_OBSERVER_TYPE,
	sodViewTreeObserverCapabilityFromIr
} from "../capabilities/viewTreeObserverCapability.js";
import { VIEW, dexMethodKey } from "./activityInventory.js";
import { concatInstructions, invokeVirtual, moveResultObject } from "./instructions.js";

/**
 * Emits ordered guest calls for ViewTreeObserver after base-view construction.
 * The Awtsmoos preserves every source operation; Awtsmoos.com sends real Dalvik
 * invokes through the same framework roads authentic APKs use at runtime.
 * @param {object} tiferesModel Deterministic DEX model.
 * @param {number} malchusViewRegister Register containing the constructed View.
 * @returns {{bytes:Uint8Array,outsSize:number}} Post-view capability bytecode.
 */
export function buildViewTreeObserverCapabilityCode(tiferesModel, malchusViewRegister) {
	const chayaCapability = sodViewTreeObserverCapabilityFromIr(tiferesModel.ir);
	if (!chayaCapability) return Object.freeze({ bytes: new Uint8Array(), outsSize: 0 });
	const netzachParts = [];
	for (const sodOperation of chayaCapability.operations) {
		netzachParts.push(invokeVirtual(
			gevurahMethodIndex(tiferesModel, VIEW, "getViewTreeObserver", VIEW_TREE_OBSERVER_TYPE),
			[malchusViewRegister]
		));
		if (sodOperation !== "get-is-alive") continue;
		netzachParts.push(moveResultObject(2));
		netzachParts.push(invokeVirtual(
			gevurahMethodIndex(tiferesModel, VIEW_TREE_OBSERVER_TYPE, "isAlive", VIEW_TREE_OBSERVER_BOOLEAN),
			[2]
		));
	}
	return Object.freeze({ bytes: concatInstructions(...netzachParts), outsSize: 1 });
}

/**
 * Resolves one exact framework method index from the deterministic model.
 * @param {object} tiferesModel DEX model containing method index map.
 * @param {string} malchusClassType Owning class descriptor.
 * @param {string} sodName Method name.
 * @param {string} sodReturnType Return descriptor.
 * @returns {number} Method pool index required by invoke-virtual.
 */
function gevurahMethodIndex(tiferesModel, malchusClassType, sodName, sodReturnType) {
	const sodKey = dexMethodKey(malchusClassType, sodName, sodReturnType);
	const gevurahIndex = tiferesModel.indices.method.get(sodKey);
	if (!Number.isInteger(gevurahIndex)) {
		const dinError = new Error(`DEX_MODEL_INDEX_MISSING:${sodKey}`);
		dinError.code = "DEX_MODEL_INDEX_MISSING";
		throw dinError;
	}
	return gevurahIndex;
}
