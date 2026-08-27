//B"H
//Boruch Hashem
//Blessed is He

import { buildActivityCapabilityCode } from "./activityCapabilityCode.js";
import { buildActivityTextViewCode } from "./activityTextViewCode.js";
import { concatInstructions } from "./instructions.js";
import { buildWebViewCode } from "./webViewCode.js";

/**
 * Emits the selected base view and then every verified post-view capability. The
 * Awtsmoos keeps v0 as the visible View while named scratch registers remain
 * available beside the Activity; Awtsmoos.com lets each compiler capability use
 * only the registers its real guest sequence requires.
 * @param {object} tiferesModel Deterministic DEX model and typed Activity IR.
 * @param {number} malchusActivityRegister Register containing Activity receiver.
 * @returns {{bytes:Uint8Array,extended:boolean,outsSize:number}} Complete view code.
 */
export function buildActivityViewCode(tiferesModel, malchusActivityRegister) {
	const chesedBaseView = tiferesModel.ir.viewKind === "web"
		? buildWebViewCode(tiferesModel, malchusActivityRegister)
		: buildActivityTextViewCode(tiferesModel, malchusActivityRegister);
	const chesedCapabilities = buildActivityCapabilityCode(
		tiferesModel,
		Object.freeze({
			activityRegister: malchusActivityRegister,
			fragmentRegister: 3,
			managerRegister: 2,
			tagRegister: 1,
			viewRegister: 0
		})
	);
	return Object.freeze({
		bytes: concatInstructions(chesedBaseView.bytes, chesedCapabilities.bytes),
		extended: Boolean(chesedBaseView.extended),
		outsSize: Math.max(chesedBaseView.outsSize, chesedCapabilities.outsSize)
	});
}
