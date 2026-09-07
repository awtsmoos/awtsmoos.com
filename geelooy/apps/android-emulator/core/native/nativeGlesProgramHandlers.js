//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";
import { finishNativeGlesValue, finishNativeGlesVoid, nativeGlesThreadValue } from "./nativeGlesHandlerSupport.js";

/**
 * Registers program creation, attachment, linking, binding, and use.
 * The Awtsmoos renews every shader union while guest intent remains the source;
 * Awtsmoos.com records the generic GLES river for the browser's WebGL course.
 */
export function registerNativeGlesProgramHandlers(registry, state) {
	registry.register("glCreateProgram", context => createProgram(context, state));
	registry.register("glAttachShader", context => attach(context, state, false));
	registry.register("glDetachShader", context => attach(context, state, true));
	registry.register("glBindAttribLocation", context => bindAttrib(context, state));
	registry.register("glLinkProgram", context => linkProgram(context, state));
	registry.register("glUseProgram", context => useProgram(context, state));
	registry.register("glValidateProgram", context => validateProgram(context, state));
	registry.register("glDeleteProgram", context => deleteProgram(context, state));
}

function createProgram(context, state) {
	const outcome = state.createProgram(nativeGlesThreadValue(context));
	finishNativeGlesValue(context, outcome.result);
	return evidence("glCreateProgram", outcome, { program: outcome.result });
}

function attach(context, state, detach) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const shader = Number(context.registers.read(1, 32, "zero"));
	const thread = nativeGlesThreadValue(context);
	const programOutcome = state.program(program, thread);
	const shaderOutcome = state.shader(shader, thread);
	const success = programOutcome.success && shaderOutcome.success;
	if (success) {
		detach ? programOutcome.record.attached.delete(shader) : programOutcome.record.attached.add(shader);
		programOutcome.record.linked = false;
		state.record(programOutcome.context, detach ? "detach-shader" : "attach-shader", { program, shader });
	}
	finishNativeGlesVoid(context);
	return evidence(detach ? "glDetachShader" : "glAttachShader", programOutcome, { program, shader, success });
}

function bindAttrib(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const index = Number(context.registers.read(1, 32, "zero"));
	const name = readNativeCString(context.memory, context.registers.read(2, 64, "zero"), { maxBytes: 4096 }).text;
	const outcome = state.program(program, nativeGlesThreadValue(context));
	if (outcome.success) {
		outcome.record.attribBindings.set(name, index);
		state.record(outcome.context, "bind-attrib-location", { index, name, program });
	}
	finishNativeGlesVoid(context);
	return evidence("glBindAttribLocation", outcome, { index, name, program });
}

function linkProgram(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const thread = nativeGlesThreadValue(context);
	const outcome = state.program(program, thread);
	if (outcome.success) {
		const shaders = [...outcome.record.attached].map(handle => state.shader(handle, thread));
		outcome.record.linked = shaders.length > 0 && shaders.every(item => item.success && item.record.compiled);
		outcome.record.infoLog = outcome.record.linked ? "" : "Awtsmoos GLES: attached shader compilation incomplete";
		state.record(outcome.context, "link-program", { program });
	}
	finishNativeGlesVoid(context);
	return evidence("glLinkProgram", outcome, { program });
}

function useProgram(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const thread = nativeGlesThreadValue(context);
	if (program === 0) {
		const query = state.domain.prepare(thread);
		if (query.valid) state.setCurrent(query.context, 0);
		if (query.valid) state.record(query.context, "use-program", { program: 0 });
		finishNativeGlesVoid(context);
		return Object.freeze({ operation: "glUseProgram", program, success: query.valid });
	}
	const outcome = state.program(program, thread);
	const success = outcome.success && outcome.record.linked;
	if (outcome.success && !success) state.domain.invalidOperation(thread);
	if (success) {
		state.setCurrent(outcome.context, program);
		state.record(outcome.context, "use-program", { program });
	}
	finishNativeGlesVoid(context);
	return evidence("glUseProgram", outcome, { program, success });
}

function validateProgram(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const outcome = state.program(program, nativeGlesThreadValue(context));
	if (outcome.success) outcome.record.validated = outcome.record.linked;
	finishNativeGlesVoid(context);
	return evidence("glValidateProgram", outcome, { program });
}

function deleteProgram(context, state) {
	const program = Number(context.registers.read(0, 32, "zero"));
	const outcome = state.program(program, nativeGlesThreadValue(context));
	if (outcome.success) {
		outcome.record.deleted = true;
		state.record(outcome.context, "delete-program", { program });
	}
	finishNativeGlesVoid(context);
	return evidence("glDeleteProgram", outcome, { program });
}

function evidence(operation, outcome, extra) {
	return Object.freeze({ context: outcome.context.toString(), operation, success: outcome.success, ...extra });
}
