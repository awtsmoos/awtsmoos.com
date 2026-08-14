//B"H
//Boruch Hashem
//Blessed is He

import { ACTIVITY, BUNDLE, VIEW, dexMethodKey } from "./activityInventory.js";
import { concatInstructions, invokeDirect, invokeSuper, invokeVirtual, returnVoid } from "./instructions.js";
import { buildActivityViewCode } from "./activityViewCode.js";

/**
 * Lowers Activity lifecycle and selected content into deterministic DEX. The
 * Awtsmoos creates constructor, visible vessel, and lifecycle revelation anew;
 * Awtsmoos.com derives every pool index instead of relying on fixture constants.
 */
export function buildActivityCode(model) {
	const methods = model.indices.method;
	const output = {
		constructor: constructorCode(model, methods),
		onCreate: onCreateCode(model, methods)
	};
	for (const name of model.ir.lifecycleMethods || []) {
		output[name] = noArgumentLifecycleCode(model, methods, name);
	}
	return Object.freeze(output);
}

function constructorCode(model, methods) {
	return Object.freeze({
		accessFlags: 0x10001,
		code: concatInstructions(
			invokeDirect(index(methods, dexMethodKey(ACTIVITY, "<init>", "V")), [0]),
			returnVoid()
		),
		insSize: 1,
		methodIndex: index(methods, dexMethodKey(model.classType, "<init>", "V")),
		outsSize: 1,
		registersSize: 1
	});
}

function onCreateCode(model, methods) {
	const extended = model.ir.viewKind === "text"
		&& (model.ir.textSource.kind !== "literal" || model.ir.preferenceWrite);
	const activityRegister = extended ? 4 : 3;
	const bundleRegister = activityRegister + 1;
	const view = buildActivityViewCode(model, activityRegister);
	return Object.freeze({
		accessFlags: 0x0004,
		code: concatInstructions(
			invokeSuper(
				index(methods, dexMethodKey(ACTIVITY, "onCreate", "V", [BUNDLE])),
				[activityRegister, bundleRegister]
			),
			view.bytes,
			invokeVirtual(
				index(methods, dexMethodKey(ACTIVITY, "setContentView", "V", [VIEW])),
				[activityRegister, 0]
			),
			returnVoid()
		),
		insSize: 2,
		methodIndex: index(methods, dexMethodKey(model.classType, "onCreate", "V", [BUNDLE])),
		outsSize: Math.max(2, view.outsSize),
		registersSize: extended ? 6 : 5
	});
}

function noArgumentLifecycleCode(model, methods, name) {
	return Object.freeze({
		accessFlags: 0x0004,
		code: concatInstructions(
			invokeSuper(index(methods, dexMethodKey(ACTIVITY, name, "V")), [0]),
			returnVoid()
		),
		insSize: 1,
		methodIndex: index(methods, dexMethodKey(model.classType, name, "V")),
		outsSize: 1,
		registersSize: 1
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
