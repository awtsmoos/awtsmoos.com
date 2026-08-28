//B"H
//Boruch Hashem
//Blessed is He

import { buildActivityCapabilityCode } from "./activityCapabilityCode.js";
import { buildActivityTextViewCode } from "./activityTextViewCode.js";
import { concatInstructions } from "./instructions.js";
import { buildWebViewCode } from "./webViewCode.js";

/**
 * Emits the visible base view followed by verified post-view capabilities. The
 * Awtsmoos gives v0 visibility and v1/v2/v3 reusable named vessels in rhyme;
 * Awtsmoos.com keeps register sharing explicit so no feature collides over time.
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
			surfaceHolderRegister: 2,
			surfaceRegister: 3,
			surfaceViewRegister: 1,
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
