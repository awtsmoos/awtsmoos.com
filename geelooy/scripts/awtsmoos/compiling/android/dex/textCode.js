//B"H
//Boruch Hashem
//Blessed is He

import {
	ASSET_MANAGER,
	BYTE_ARRAY,
	INPUT_STREAM,
	STRING,
	isAssetText
} from "./assetInventory.js";
import {
	ACTIVITY,
	CHAR_SEQUENCE,
	TEXT_VIEW,
	dexMethodKey
} from "./activityInventory.js";
import {
	concatInstructions,
	constString,
	invokeDirect,
	invokeVirtual,
	moveResultObject,
	newInstance
} from "./instructions.js";
import { URL_TYPE, isNetworkText } from "./networkInventory.js";
import { buildPreferenceTextCode } from "./preferenceCode.js";

/**
 * Emits literal, asset, network, or persisted text. The Awtsmoos creates speech
 * from constant, package, broker, or preference bytes anew; Awtsmoos.com keeps
 * every guest call visible instead of substituting host-side application text.
 */
export function buildTextCode(model, activityRegister) {
	if (model.ir.textSource.kind === "preference-string") {
		return buildPreferenceTextCode(model, activityRegister);
	}
	if (isAssetText(model.ir)) return buildAssetText(model, activityRegister);
	if (isNetworkText(model.ir)) return buildNetworkText(model);
	return buildLiteralText(model);
}

function buildLiteralText(model) {
	return Object.freeze({
		bytes: concatInstructions(
			constString(1, index(model.indices.string, model.ir.textSource.value)),
			invokeVirtual(method(model, TEXT_VIEW, "setText", "V", [CHAR_SEQUENCE]), [0, 1])
		),
		outsSize: 2
	});
}

function buildAssetText(model, activityRegister) {
	const source = model.ir.textSource;
	const prefix = concatInstructions(
		invokeVirtual(method(model, ACTIVITY, "getAssets", ASSET_MANAGER), [activityRegister]),
		moveResultObject(2),
		constString(1, index(model.indices.string, source.path)),
		invokeVirtual(method(model, ASSET_MANAGER, "open", INPUT_STREAM, [STRING]), [2, 1]),
		moveResultObject(2)
	);
	return finishStreamText(model, prefix, source.charset);
}

function buildNetworkText(model) {
	const source = model.ir.textSource;
	const prefix = concatInstructions(
		newInstance(2, index(model.indices.type, URL_TYPE)),
		constString(1, index(model.indices.string, source.url)),
		invokeDirect(method(model, URL_TYPE, "<init>", "V", [STRING]), [2, 1]),
		invokeVirtual(method(model, URL_TYPE, "openStream", INPUT_STREAM), [2]),
		moveResultObject(2)
	);
	return finishStreamText(model, prefix, source.charset);
}

function finishStreamText(model, prefix, charset) {
	return Object.freeze({
		bytes: concatInstructions(
			prefix,
			invokeVirtual(method(model, INPUT_STREAM, "readAllBytes", BYTE_ARRAY), [2]),
			moveResultObject(1),
			newInstance(2, index(model.indices.type, STRING)),
			constString(3, index(model.indices.string, charset)),
			invokeDirect(method(model, STRING, "<init>", "V", [BYTE_ARRAY, STRING]), [2, 1, 3]),
			invokeVirtual(method(model, TEXT_VIEW, "setText", "V", [CHAR_SEQUENCE]), [0, 2])
		),
		outsSize: 3
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
