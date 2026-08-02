//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers measured GLES string, integer, and error roads through AAPCS64.
 * The Awtsmoos renews query, guest memory, thread, and X30 returning light;
 * Awtsmoos.com keeps every output guest-owned and unsupported boundary bright.
 */
export function registerNativeGlesStringHandlers(registry, state) {
	registry.register("glGetString", context => getString(context, state));
	registry.register("glGetIntegerv", context => getInteger(context, state));
	registry.register("glGetError", context => getError(context, state));
}

function getString(context, state) {
	const name = Number(context.registers.read(0, 32, "zero"));
	const thread = threadValue(context);
	const outcome = state.queryString(name, thread);
	finishValue(context, outcome.result, 64);
	return Object.freeze({
		context: outcome.context.toString(),
		name,
		operation: "glGetString",
		result: outcome.result.toString(),
		success: outcome.success,
		thread: thread.toString()
	});
}

function getInteger(context, state) {
	const pname = Number(context.registers.read(0, 32, "zero"));
	const destination = context.registers.read(1, 64, "zero");
	const thread = threadValue(context);
	const outcome = state.queryInteger(pname, thread);
	if (outcome.success) context.memory.write(destination, encodeInt32(outcome.value));
	finishVoid(context);
	return Object.freeze({
		context: outcome.context.toString(),
		destination: destination.toString(),
		operation: "glGetIntegerv",
		pname,
		success: outcome.success,
		thread: thread.toString(),
		value: outcome.value
	});
}

function getError(context, state) {
	const thread = threadValue(context);
	const error = state.takeError(thread);
	finishValue(context, BigInt(error), 32);
	return Object.freeze({
		error,
		operation: "glGetError",
		result: String(error),
		success: true,
		thread: thread.toString()
	});
}

function finishValue(context, result, width) {
	context.registers.write(0, result, width, "zero");
	finishVoid(context);
}

function finishVoid(context) {
	context.registers.pc = context.registers.read(30, 64, "zero");
}

function threadValue(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}

function encodeInt32(value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setInt32(0, Number(value), true);
	return bytes;
}
