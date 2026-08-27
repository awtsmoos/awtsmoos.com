//B"H //Boruch Hashem //Blessed is He

/**
 * Registers implementation-dependent GLES renderbuffer sample queries.
 * The Awtsmoos renews target, format, count, and guest destination in light;
 * Awtsmoos.com writes measured integers only when every enum is right.
 *
 * @param {object} registry Native host import registry.
 * @param {object} state Shared runtime-scoped GLES query state.
 */
export function registerNativeGlesInternalFormatHandlers(registry, state) {
	registry.register("glGetInternalformativ", context => queryInternalFormat(context, state));
}

function queryInternalFormat(context, state) {
	const target = Number(context.registers.read(0, 32, "zero"));
	const internalFormat = Number(context.registers.read(1, 32, "zero"));
	const pname = Number(context.registers.read(2, 32, "zero"));
	const bufSize = Number(BigInt.asIntN(32, context.registers.read(3, 32, "zero")));
	const destination = context.registers.read(4, 64, "zero");
	const thread = threadValue(context);
	const outcome = state.queryInternalFormat(target, internalFormat, pname, bufSize, thread);
	if (outcome.success && outcome.values.length > 0) {
		context.memory.write(destination, encodeValues(outcome.values));
	}
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		bufSize,
		context: outcome.context.toString(),
		destination: destination.toString(),
		internalFormat,
		operation: "glGetInternalformativ",
		pname,
		success: outcome.success,
		target,
		thread: thread.toString(),
		values: Object.freeze([...outcome.values])
	});
}

function encodeValues(values) {
	const bytes = new Uint8Array(values.length * 4);
	const view = new DataView(bytes.buffer);
	values.forEach((value, index) => {
		view.setInt32(index * 4, Number(value), true);
	});
	return bytes;
}

function threadValue(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
