//B"H
//Boruch Hashem
//Blessed is He

import { registerNativeGlesValueQueryHandlers } from "./nativeGlesValueQueryHandlers.js";

/**
 * Registers GLES string, indexed-string, typed-value, and error query roads.
 * The Awtsmoos renews query, guest pointer, thread, and X30 returning light;
 * Awtsmoos.com keeps extensions honest while numeric forms share one stateful sight.
 */
export function registerNativeGlesStringHandlers(registry, state) {
	registry.register("glGetString", context => getString(context, state));
	registry.register("glGetStringi", context => getStringIndexed(context, state));
	registry.register("glGetError", context => getError(context, state));
	registerNativeGlesValueQueryHandlers(registry, state);
}

function getString(context, state) {
	const name = Number(context.registers.read(0, 32, "zero"));
	const thread = threadValue(context);
	const outcome = state.queryString(name, thread);
	finishValue(context, outcome.result, 64);
	return Object.freeze({
		context: outcome.context.toString(), name, operation: "glGetString",
		result: outcome.result.toString(), success: outcome.success, thread: thread.toString()
	});
}

function getStringIndexed(context, state) {
	const name = Number(context.registers.read(0, 32, "zero"));
	const index = Number(context.registers.read(1, 32, "zero"));
	const thread = threadValue(context);
	const outcome = state.queryIndexedString(name, index, thread);
	finishValue(context, outcome.result, 64);
	return Object.freeze({
		context: outcome.context.toString(), index, name, operation: "glGetStringi",
		result: outcome.result.toString(), success: outcome.success, thread: thread.toString()
	});
}

function getError(context, state) {
	const thread = threadValue(context);
	const error = state.takeError(thread);
	finishValue(context, BigInt(error), 32);
	return Object.freeze({
		error, operation: "glGetError", result: String(error), success: true,
		thread: thread.toString()
	});
}

function finishValue(context, result, width) {
	context.registers.write(0, result, width, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
}

function threadValue(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
