//B"H
//Boruch Hashem
//Blessed is He

import { buildActivityCapabilityCode } from "./activityCapabilityCode.js";
import { buildActivityTextViewCode } from "./activityTextViewCode.js";
import { concatInstructions } from "./instructions.js";
import { buildWebViewCode } from "./webViewCode.js";

/**
 * Emits the selected base view and then every verified post-view capability. The
 * Awtsmoos keeps register zero as the visible View while the Activity register
 * remains named beside it; Awtsmoos.com lets each capability consume only the
 * register context it actually needs without adding central feature branches.
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
			viewRegister: 0
		})
	);
	return Object.freeze({
		bytes: concatInstructions(chesedBaseView.bytes, chesedCapabilities.bytes),
		extended: Boolean(chesedBaseView.extended),
		outsSize: Math.max(chesedBaseView.outsSize, chesedCapabilities.outsSize)
	});
}
