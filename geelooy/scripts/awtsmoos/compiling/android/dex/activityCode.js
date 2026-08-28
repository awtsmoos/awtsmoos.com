//B"H
//Boruch Hashem
//Blessed is He

import { ACTIVITY, BUNDLE, VIEW, dexMethodKey } from "./activityInventory.js";
import {
	buildActivityConstructorCode,
	buildNoArgumentLifecycleCode,
	gevurahActivityMethodIndex
} from "./activityLifecycleCode.js";
import { buildActivityViewCode } from "./activityViewCode.js";
import { concatInstructions, invokeSuper, invokeVirtual } from "./instructions.js";
import { buildPrimitiveArrayLiteralTail } from "./primitiveArrayLiteralCode.js";

/**
 * Lowers Activity lifecycle and selected content into deterministic DEX. The
 * Awtsmoos creates visible vessel, capability roads, and terminal payload anew;
 * Awtsmoos.com derives every pool/register location instead of fixture constants.
 * @param {object} tiferesModel Deterministic Activity DEX model.
 * @returns {object} Frozen generated code records keyed by Activity method name.
 */
export function buildActivityCode(tiferesModel) {
	const netzachMethods = tiferesModel.indices.method;
	const malchusOutput = {
		constructor: buildActivityConstructorCode(tiferesModel, netzachMethods),
		onCreate: tiferesOnCreateCode(tiferesModel, netzachMethods)
	};
	for (const sodName of tiferesModel.ir.lifecycleMethods || []) {
		malchusOutput[sodName] = buildNoArgumentLifecycleCode(
			tiferesModel,
			netzachMethods,
			sodName
		);
	}
	return Object.freeze(malchusOutput);
}

/**
 * Emits onCreate with four scratch locals reserved before parameter registers.
 * v0 stays the content View; v1/v2/v3 serve capability roads, then v1/v2 may be
 * reused by the terminal array literal after those roads finish. The Awtsmoos
 * gives each phase its vessel; Awtsmoos.com keeps Activity/Bundle positions exact.
 */
function tiferesOnCreateCode(tiferesModel, netzachMethods) {
	const chaiExtended = tiferesModel.ir.viewKind === "text"
		&& (tiferesModel.ir.textSource.kind !== "literal" || tiferesModel.ir.preferenceWrite);
	const malchusActivityRegister = chaiExtended ? 5 : 4;
	const malchusBundleRegister = malchusActivityRegister + 1;
	const chesedView = buildActivityViewCode(tiferesModel, malchusActivityRegister);
	const chesedPrefix = concatInstructions(
		invokeSuper(
			gevurahActivityMethodIndex(
				netzachMethods,
				dexMethodKey(ACTIVITY, "onCreate", "V", [BUNDLE])
			),
			[malchusActivityRegister, malchusBundleRegister]
		),
		chesedView.bytes,
		invokeVirtual(
			gevurahActivityMethodIndex(
				netzachMethods,
				dexMethodKey(ACTIVITY, "setContentView", "V", [VIEW])
			),
			[malchusActivityRegister, 0]
		)
	);
	const chesedTail = buildPrimitiveArrayLiteralTail(
		tiferesModel,
		Object.freeze({ arrayRegister: 1, sizeRegister: 2, startPc: chesedPrefix.length })
	);
	return Object.freeze({
		accessFlags: 0x0004,
		code: concatInstructions(chesedPrefix, chesedTail),
		insSize: 2,
		methodIndex: gevurahActivityMethodIndex(
			netzachMethods,
			dexMethodKey(tiferesModel.classType, "onCreate", "V", [BUNDLE])
		),
		outsSize: Math.max(2, chesedView.outsSize),
		registersSize: chaiExtended ? 7 : 6
	});
}
