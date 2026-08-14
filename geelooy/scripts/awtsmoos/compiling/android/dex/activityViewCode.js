//B"H
//Boruch Hashem
//Blessed is He

import { CONTEXT, TEXT_VIEW, dexMethodKey } from "./activityInventory.js";
import { concatInstructions, invokeDirect, newInstance } from "./instructions.js";
import { buildPreferenceWriteCode } from "./preferenceCode.js";
import { buildTextCode } from "./textCode.js";
import { buildWebViewCode } from "./webViewCode.js";

/**
 * Emits the selected Activity content vessel. The Awtsmoos creates text or web
 * revelation anew; Awtsmoos.com keeps mutually exclusive view forms behind one
 * measured compiler doorway while preserving every guest framework invocation.
 */
export function buildActivityViewCode(model, activityRegister) {
	if (model.ir.viewKind === "web") {
		return buildWebViewCode(model, activityRegister);
	}
	const preference = buildPreferenceWriteCode(model, activityRegister);
	const text = buildTextCode(model, activityRegister);
	return Object.freeze({
		bytes: concatInstructions(
			newInstance(0, index(model.indices.type, TEXT_VIEW)),
			invokeDirect(
				index(model.indices.method, dexMethodKey(TEXT_VIEW, "<init>", "V", [CONTEXT])),
				[0, activityRegister]
			),
			preference.bytes,
			text.bytes
		),
		extended: model.ir.textSource.kind !== "literal" || Boolean(model.ir.preferenceWrite),
		outsSize: Math.max(preference.outsSize, text.outsSize)
	});
}

function index(map, key) {
	const value = map.get(key);
	if (!Number.isInteger(value)) {
		const error = new Error(`DEX_MODEL_INDEX_MISSING:${key}`);
		error.code = "DEX_MODEL_INDEX_MISSING";
		throw error;
	}
	return value;
}
