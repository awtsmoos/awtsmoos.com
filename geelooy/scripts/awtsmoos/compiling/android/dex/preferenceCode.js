//B"H
//Boruch Hashem
//Blessed is He

import { STRING } from "./assetInventory.js";
import { ACTIVITY, CHAR_SEQUENCE, TEXT_VIEW, dexMethodKey } from "./activityInventory.js";
import {
	EDITOR,
	INTEGER,
	PREFERENCES
} from "./preferenceInventory.js";
import {
	concatInstructions,
	const4,
	constString,
	invokeInterface,
	invokeVirtual,
	moveResultObject
} from "./instructions.js";

/**
 * Emits real SharedPreferences writer and reader interface chains. The Awtsmoos
 * creates handle, editor, mutation, commit, default, and returned String anew;
 * Awtsmoos.com keeps each guest call visible and capability-neutral in DEX.
 */
export function buildPreferenceWriteCode(model, activityRegister) {
	const write = model.ir.preferenceWrite;
	if (!write) return Object.freeze({ bytes: new Uint8Array(), outsSize: 0 });
	return Object.freeze({
		bytes: concatInstructions(
			constString(1, string(model, write.name)),
			const4(2, 0),
			invokeVirtual(
				method(model, ACTIVITY, "getSharedPreferences", PREFERENCES, [STRING, INTEGER]),
				[activityRegister, 1, 2]
			),
			moveResultObject(2),
			invokeInterface(method(model, PREFERENCES, "edit", EDITOR), [2]),
			moveResultObject(2),
			constString(1, string(model, write.key)),
			constString(3, string(model, write.value)),
			invokeInterface(
				method(model, EDITOR, "putString", EDITOR, [STRING, STRING]),
				[2, 1, 3]
			),
			moveResultObject(2),
			invokeInterface(method(model, EDITOR, "commit", "Z"), [2])
		),
		outsSize: 3
	});
}

export function buildPreferenceTextCode(model, activityRegister) {
	const source = model.ir.textSource;
	return Object.freeze({
		bytes: concatInstructions(
			constString(1, string(model, source.name)),
			const4(2, 0),
			invokeVirtual(
				method(model, ACTIVITY, "getSharedPreferences", PREFERENCES, [STRING, INTEGER]),
				[activityRegister, 1, 2]
			),
			moveResultObject(2),
			constString(1, string(model, source.key)),
			constString(3, string(model, source.defaultValue)),
			invokeInterface(
				method(model, PREFERENCES, "getString", STRING, [STRING, STRING]),
				[2, 1, 3]
			),
			moveResultObject(2),
			invokeVirtual(
				method(model, TEXT_VIEW, "setText", "V", [CHAR_SEQUENCE]),
				[0, 2]
			)
		),
		outsSize: 3
	});
}

function method(model, classType, name, returnType, parameters = []) {
	return required(
		model.indices.method,
		dexMethodKey(classType, name, returnType, parameters)
	);
}

function string(model, value) {
	return required(model.indices.string, value);
}

function required(map, key) {
	const value = map.get(key);
	if (!Number.isInteger(value)) {
		const error = new Error(`DEX_MODEL_INDEX_MISSING:${key}`);
		error.code = "DEX_MODEL_INDEX_MISSING";
		throw error;
	}
	return value;
}
