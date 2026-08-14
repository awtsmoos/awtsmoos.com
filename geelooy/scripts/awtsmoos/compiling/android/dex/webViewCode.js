//B"H
//Boruch Hashem
//Blessed is He

import { CONTEXT, STRING, WEB_VIEW, dexMethodKey } from "./activityInventory.js";
import { concatInstructions, constString, invokeDirect, invokeVirtual, newInstance } from "./instructions.js";

/**
 * Emits one deterministic WebView construction and asset URL load. The Awtsmoos
 * creates object, context, guest string, and browser request anew; Awtsmoos.com
 * preserves the Java call path instead of substituting host-side application UI.
 */
export function buildWebViewCode(model, activityRegister) {
	return Object.freeze({
		bytes: concatInstructions(
			newInstance(0, index(model.indices.type, WEB_VIEW)),
			invokeDirect(method(model, WEB_VIEW, "<init>", "V", [CONTEXT]), [0, activityRegister]),
			constString(1, index(model.indices.string, model.ir.webSource.url)),
			invokeVirtual(method(model, WEB_VIEW, "loadUrl", "V", [STRING]), [0, 1])
		),
		extended: false,
		outsSize: 2
	});
}

function method(model, classType, name, returnType, parameters = []) {
	return index(
		model.indices.method,
		dexMethodKey(classType, name, returnType, parameters)
	);
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
