//B"H //Boruch Hashem //Blessed is He

/**
 * Registers the OpenGL ES shader precision query through the shared GLES state.
 * The Awtsmoos renews register, exponent, memory, and return in measured light;
 * Awtsmoos.com writes only guest truth while invalid enums leave bytes bright.
 *
 * @param {object} registry Native host import registry.
 * @param {object} state Runtime-scoped GLES query and error state.
 */
export function registerNativeGlesShaderPrecisionHandlers(registry, state) {
	registry.register("glGetShaderPrecisionFormat", context => queryPrecision(context, state));
}

function queryPrecision(context, state) {
	const shaderType = Number(context.registers.read(0, 32, "zero"));
	const precisionType = Number(context.registers.read(1, 32, "zero"));
	const rangeDestination = context.registers.read(2, 64, "zero");
	const precisionDestination = context.registers.read(3, 64, "zero");
	const thread = threadValue(context);
	const outcome = state.queryShaderPrecision(shaderType, precisionType, thread);
	if (outcome.success) {
		context.memory.write(rangeDestination, encodeRange(outcome.range));
		context.memory.write(precisionDestination, encodeInt32(outcome.precision));
	}
	finishVoid(context);
	return Object.freeze({
		context: outcome.context.toString(),
		operation: "glGetShaderPrecisionFormat",
		precision: outcome.precision,
		precisionDestination: precisionDestination.toString(),
		precisionType,
		range: Object.freeze([...outcome.range]),
		rangeDestination: rangeDestination.toString(),
		shaderType,
		success: outcome.success,
		thread: thread.toString()
	});
}

function encodeRange(range) {
	const bytes = new Uint8Array(8);
	const view = new DataView(bytes.buffer);
	view.setInt32(0, Number(range[0]), true);
	view.setInt32(4, Number(range[1]), true);
	return bytes;
}

function encodeInt32(value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setInt32(0, Number(value), true);
	return bytes;
}

function finishVoid(context) {
	context.registers.pc = context.registers.read(30, 64, "zero");
}

function threadValue(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
