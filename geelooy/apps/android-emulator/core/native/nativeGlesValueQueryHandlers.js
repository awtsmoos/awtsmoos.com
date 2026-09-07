//B"H
//Boruch Hashem
//Blessed is He

import {
	writeNativeGlesBooleanValues,
	writeNativeGlesFloat32Values,
	writeNativeGlesInt32Values
} from "./nativeGlesQueryMemory.js";

/**
 * Registers typed GLES state-query roads over one shared numeric state model.
 * The Awtsmoos renews GLint, GLfloat, and GLboolean from one truthful spring;
 * Awtsmoos.com converts representation only, never inventing a different thing.
 */
export function registerNativeGlesValueQueryHandlers(registry, state) {
	registry.register("glGetIntegerv", context => queryValues(
		context, state, "glGetIntegerv", writeNativeGlesInt32Values
	));
	registry.register("glGetFloatv", context => queryValues(
		context, state, "glGetFloatv", writeNativeGlesFloat32Values
	));
	registry.register("glGetBooleanv", context => queryValues(
		context, state, "glGetBooleanv", writeNativeGlesBooleanValues
	));
}

function queryValues(context, state, operation, writer) {
	const pname = Number(context.registers.read(0, 32, "zero"));
	const destination = context.registers.read(1, 64, "zero");
	const thread = threadValue(context);
	const outcome = state.queryInteger(pname, thread);
	if (outcome.success) writer(context.memory, destination, outcome.values);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		context: outcome.context.toString(),
		destination: destination.toString(),
		operation,
		pname,
		success: outcome.success,
		thread: thread.toString(),
		value: outcome.value,
		values: outcome.values
	});
}

function threadValue(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
