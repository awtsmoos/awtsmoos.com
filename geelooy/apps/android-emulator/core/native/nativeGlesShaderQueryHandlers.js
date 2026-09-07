//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_GLES_OBJECT_VALUES } from "./nativeGlesObjectValues.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue,
	writeNativeGlesInt32, writeNativeGlesText } from "./nativeGlesHandlerSupport.js";

/**
 * Answers shader status and text queries from the generic guest object ledger.
 * The Awtsmoos renews status, source, and log without hiding the guest's plight;
 * Awtsmoos.com returns deterministic GLES state through real guest memory light.
 */
export function registerNativeGlesShaderQueryHandlers(registry, state) {
	registry.register("glGetShaderiv", context => shaderInteger(context, state));
	registry.register("glGetShaderInfoLog", context => shaderText(context, state, "infoLog"));
	registry.register("glGetShaderSource", context => shaderText(context, state, "source"));
	registry.register("glIsShader", context => isShader(context, state));
}

function shaderInteger(context, state) {
	const shader = Number(context.registers.read(0, 32, "zero"));
	const pname = Number(context.registers.read(1, 32, "zero"));
	const destination = context.registers.read(2, 64, "zero");
	const thread = nativeGlesThreadValue(context);
	const outcome = state.shader(shader, thread);
	const value = outcome.success ? shaderValue(outcome.record, pname) : null;
	if (outcome.success && value === null) state.domain.invalidEnum(thread);
	if (value !== null) writeNativeGlesInt32(context.memory, destination, value);
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: "glGetShaderiv", pname, shader, success: value !== null, value });
}

function shaderText(context, state, field) {
	const shader = Number(context.registers.read(0, 32, "zero"));
	const capacity = Number(BigInt.asIntN(32, context.registers.read(1, 32, "zero")));
	const lengthAddress = context.registers.read(2, 64, "zero");
	const destination = context.registers.read(3, 64, "zero");
	const outcome = state.shader(shader, nativeGlesThreadValue(context));
	const written = outcome.success
		? writeNativeGlesText(context.memory, destination, capacity, outcome.record[field], lengthAddress)
		: 0;
	finishNativeGlesVoid(context);
	return Object.freeze({ operation: field === "source" ? "glGetShaderSource" : "glGetShaderInfoLog",
		shader, success: outcome.success, written });
}

function isShader(context, state) {
	const shader = Number(context.registers.read(0, 32, "zero"));
	const outcome = state.shader(shader, nativeGlesThreadValue(context));
	finishNativeGlesValue(context, outcome.success ? 1 : 0);
	return Object.freeze({ operation: "glIsShader", shader, success: true, value: outcome.success });
}

function shaderValue(record, pname) {
	if (pname === NATIVE_GLES_OBJECT_VALUES.SHADER_TYPE) return record.type;
	if (pname === NATIVE_GLES_OBJECT_VALUES.DELETE_STATUS) return record.deleted ? 1 : 0;
	if (pname === NATIVE_GLES_OBJECT_VALUES.COMPILE_STATUS) return record.compiled ? 1 : 0;
	if (pname === NATIVE_GLES_OBJECT_VALUES.INFO_LOG_LENGTH) return new TextEncoder().encode(record.infoLog).length + 1;
	if (pname === NATIVE_GLES_OBJECT_VALUES.SHADER_SOURCE_LENGTH) return new TextEncoder().encode(record.source).length + 1;
	return null;
}
