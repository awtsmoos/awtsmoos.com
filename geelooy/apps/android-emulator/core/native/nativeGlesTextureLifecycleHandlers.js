//B"H
//Boruch Hashem
//Blessed is He

import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesNames, writeNativeGlesNames } from "./nativeGlesNameArray.js";

/**
 * Registers authentic texture lifecycle entrypoints over guest registers and memory.
 * The Awtsmoos renews names, units, targets, and return flow while Awtsmoos.com never fabricates host handles.
 */
export function registerNativeGlesTextureLifecycleHandlers(registry, state) {
	registry.register("glActiveTexture", context => activeTexture(context, state));
	registry.register("glBindTexture", context => bindTexture(context, state));
	registry.register("glDeleteTextures", context => deleteTextures(context, state));
	registry.register("glGenTextures", context => genTextures(context, state));
}

function activeTexture(context, state) {
	const texture = Number(context.registers.read(0, 32, "zero"));
	const success = state.active(texture, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glActiveTexture", success, texture });
}

function bindTexture(context, state) {
	const target = Number(context.registers.read(0, 32, "zero"));
	const texture = Number(context.registers.read(1, 32, "zero"));
	const success = state.bind(target, texture, nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glBindTexture", success, target, texture });
}

function deleteTextures(context, state) {
	const count = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const thread = nativeGlesThreadValue(context);
	if (count < 0) {
		state.domain.invalidValue(thread);
		finishNativeGlesVoid(context);
		return Object.freeze({ count, operation: "glDeleteTextures", success: false });
	}
	const names = readNativeGlesNames(context.memory, address, count);
	const success = state.delete(names, thread);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names, operation: "glDeleteTextures", success });
}

function genTextures(context, state) {
	const count = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const thread = nativeGlesThreadValue(context);
	if (count < 0) {
		state.domain.invalidValue(thread);
		finishNativeGlesVoid(context);
		return Object.freeze({ count, operation: "glGenTextures", success: false });
	}
	const outcome = state.generate(count, thread);
	if (outcome.success && count > 0) writeNativeGlesNames(context.memory, address, outcome.names);
	finishNativeGlesVoid(context);
	return Object.freeze({ count, names: outcome.names, operation: "glGenTextures", success: outcome.success });
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
