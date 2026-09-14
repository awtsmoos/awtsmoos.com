//B"H
//Boruch Hashem
//Blessed be He

import { readNativeGlesArgument } from "./nativeGlesArguments.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesFloat32Pointer } from "./nativeGlesParameterPointer.js";
import { writeNativeGlesFloat32Values, writeNativeGlesInt32Values } from "./nativeGlesQueryMemory.js";

/** Registers GLES3 sampler identity, float-vector setter, and typed parameter queries. */
export function registerNativeGles3SamplerQueryHandlers(registry, state) {
	registry.register("glIsSampler", context => isSampler(context, state));
	registry.register("glSamplerParameterfv", context => parameterFloatVector(context, state));
	registry.register("glGetSamplerParameteriv", context => getParameter(context, state, false));
	registry.register("glGetSamplerParameterfv", context => getParameter(context, state, true));
}

function isSampler(context, state) {
	const sampler = Number(readNativeGlesArgument(context, 0, 32));
	const value = state.is(sampler, nativeGlesThreadValue(context)) ? 1 : 0;
	finishNativeGlesValue(context, value, 32);
	return Object.freeze({ operation: "glIsSampler", sampler, success: true, value });
}

function parameterFloatVector(context, state) {
	const sampler = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const address = readNativeGlesArgument(context, 2, 64);
	const value = readNativeGlesFloat32Pointer(context.memory, address);
	const success = state.parameter(sampler, pname, value, "float", nativeGlesThreadValue(context));
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glSamplerParameterfv", pname, sampler, success, value });
}

function getParameter(context, state, floating) {
	const sampler = Number(readNativeGlesArgument(context, 0, 32));
	const pname = Number(readNativeGlesArgument(context, 1, 32));
	const address = readNativeGlesArgument(context, 2, 64);
	const outcome = state.query(sampler, pname, nativeGlesThreadValue(context));
	if (outcome.success) {
		const writer = floating ? writeNativeGlesFloat32Values : writeNativeGlesInt32Values;
		writer(context.memory, address, [outcome.value]);
	}
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: floating ? "glGetSamplerParameterfv" : "glGetSamplerParameteriv", pname, sampler, success: outcome.success, value: outcome.value });
}
