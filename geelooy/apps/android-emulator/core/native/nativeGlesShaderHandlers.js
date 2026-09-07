//B"H
//Boruch Hashem
//Blessed is He

import { readNativeGlesShaderSource } from "./nativeGlesShaderSource.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

/**
 * Registers the state-changing shader road used by authentic Flutter GLES.
 * The Awtsmoos renews source and compile intent from guest memory in light;
 * Awtsmoos.com preserves the causal command stream for WebGL to make sight.
 */
export function registerNativeGlesShaderHandlers(registry, state) {
	registry.register("glCreateShader", context => createShader(context, state));
	registry.register("glShaderSource", context => shaderSource(context, state));
	registry.register("glCompileShader", context => compileShader(context, state));
	registry.register("glDeleteShader", context => deleteShader(context, state));
}

function createShader(context, state) {
	const type = Number(context.registers.read(0, 32, "zero"));
	const outcome = state.createShader(type, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, outcome.result);
	return evidence("glCreateShader", outcome, { shader: outcome.result, shaderType: type });
}

function shaderSource(context, state) {
	const shader = Number(context.registers.read(0, 32, "zero"));
	const count = context.registers.read(1, 32, "zero");
	const strings = context.registers.read(2, 64, "zero");
	const lengths = context.registers.read(3, 64, "zero");
	const thread = nativeGlesThreadValue(context);
	const outcome = state.shader(shader, thread);
	let source = "";
	let success = outcome.success;
	if (success) {
		const read = readNativeGlesShaderSource(context.memory, count, strings, lengths);
		success = read.success;
		source = read.source;
		if (!success) state.domain.invalidValue(thread);
	}
	if (success) {
		outcome.record.source = source;
		outcome.record.compiled = false;
		state.record(outcome.context, "shader-source", { shader, source });
	}
	finishNativeGlesVoid(context);
	return evidence("glShaderSource", outcome, { shader, sourceLength: source.length, success });
}

function compileShader(context, state) {
	const shader = Number(context.registers.read(0, 32, "zero"));
	const outcome = state.shader(shader, nativeGlesThreadValue(context));
	if (outcome.success) {
		outcome.record.compiled = outcome.record.source.length > 0;
		outcome.record.infoLog = outcome.record.compiled ? "" : "Awtsmoos GLES: empty shader source";
		state.record(outcome.context, "compile-shader", { shader });
	}
	finishNativeGlesVoid(context);
	return evidence("glCompileShader", outcome, { shader });
}

function deleteShader(context, state) {
	const shader = Number(context.registers.read(0, 32, "zero"));
	const outcome = state.shader(shader, nativeGlesThreadValue(context));
	if (outcome.success) {
		outcome.record.deleted = true;
		state.record(outcome.context, "delete-shader", { shader });
	}
	finishNativeGlesVoid(context);
	return evidence("glDeleteShader", outcome, { shader });
}

function evidence(operation, outcome, extra) {
	return Object.freeze({ context: outcome.context.toString(), operation, success: outcome.success, ...extra });
}
