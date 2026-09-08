//B"H
//Boruch Hashem
//Blessed is He

import { finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";
import { readNativeGlesNames, writeNativeGlesNames } from "./nativeGlesNameArray.js";
import { readNativeGlesInt32Pointer } from "./nativeGlesParameterPointer.js";

/**
 * Registers GLES sampler lifecycle, unit binding, and scalar parameter entrypoints.
 * The Awtsmoos renews guest sampler names while Awtsmoos.com never aliases them to texture objects.
 */
export function registerNativeGlesSamplerHandlers(registry, state) {
	registry.register("glBindSampler", context => bindSampler(context, state));
	registry.register("glDeleteSamplers", context => deleteSamplers(context, state));
	registry.register("glGenSamplers", context => genSamplers(context, state));
	registry.register("glSamplerParameterf", context => parameterFloat(context, state));
	registry.register("glSamplerParameteri", context => parameterInt(context, state, false));
	registry.register("glSamplerParameteriv", context => parameterInt(context, state, true));
}

function bindSampler(context, state) {
	const unit = Number(context.registers.read(0, 32, "zero"));
	const sampler = Number(context.registers.read(1, 32, "zero"));
	const success = state.bind(unit, sampler, nativeGlesThreadValue(context));
	return finish(context, "glBindSampler", success, { sampler, unit });
}

function deleteSamplers(context, state) {
	const count = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const thread = nativeGlesThreadValue(context);
	if (count < 0) {
		state.domain.invalidValue(thread);
		return finish(context, "glDeleteSamplers", false, { count });
	}
	const names = readNativeGlesNames(context.memory, address, count);
	return finish(context, "glDeleteSamplers", state.delete(names, thread), { count, names });
}

function genSamplers(context, state) {
	const count = signed32(context.registers.read(0, 32, "zero"));
	const address = context.registers.read(1, 64, "zero");
	const thread = nativeGlesThreadValue(context);
	if (count < 0) {
		state.domain.invalidValue(thread);
		return finish(context, "glGenSamplers", false, { count });
	}
	const outcome = state.generate(count, thread);
	if (outcome.success && count > 0) writeNativeGlesNames(context.memory, address, outcome.names);
	return finish(context, "glGenSamplers", outcome.success, { count, names: outcome.names });
}

function parameterInt(context, state, pointer) {
	const sampler = Number(context.registers.read(0, 32, "zero"));
	const pname = Number(context.registers.read(1, 32, "zero"));
	const raw = context.registers.read(2, 64, "zero");
	const value = pointer ? readNativeGlesInt32Pointer(context.memory, raw) : Number(BigInt.asIntN(32, raw));
	const success = state.parameter(sampler, pname, value, "int", nativeGlesThreadValue(context));
	return finish(context, pointer ? "glSamplerParameteriv" : "glSamplerParameteri", success, { pname, sampler, value });
}

function parameterFloat(context, state) {
	const sampler = Number(context.registers.read(0, 32, "zero"));
	const pname = Number(context.registers.read(1, 32, "zero"));
	const value = context.registers.readFloat(0, 32);
	const success = state.parameter(sampler, pname, value, "float", nativeGlesThreadValue(context));
	return finish(context, "glSamplerParameterf", success, { pname, sampler, value });
}

function finish(context, operation, success, values) {
	finishNativeGlesVoid(context);
	return Object.freeze({ operation, success, ...values });
}

function signed32(value) {
	return Number(BigInt.asIntN(32, BigInt(value)));
}
