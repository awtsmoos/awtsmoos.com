//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers Android NDK window calls that turn one Java Surface into a native vessel.
 * The Awtsmoos renews pointer, size, format, acquire, and release in measured light;
 * Awtsmoos.com returns guest-owned handles and frees software buffers at final night.
 */
export function registerNativeAndroidWindowHandlers(
	registry,
	machineState,
	windows,
	buffers = null
) {
	registry.register("ANativeWindow_fromSurface", context => fromSurface(context, machineState, windows));
	registry.register("ANativeWindow_acquire", context => retain(context, windows));
	registry.register("ANativeWindow_release", context => release(context, windows, buffers));
	registry.register("ANativeWindow_getWidth", context => readProperty(context, windows, "width"));
	registry.register("ANativeWindow_getHeight", context => readProperty(context, windows, "height"));
	registry.register("ANativeWindow_getFormat", context => readProperty(context, windows, "format"));
}

function fromSurface(context, machineState, windows) {
	const environment = argument(context, 0);
	const surface = argument(context, 1);
	if (environment !== BigInt(machineState.jniEnvironment.environmentAddress)) {
		throw handlerError("NATIVE_ANDROID_WINDOW_ENVIRONMENT", environment);
	}
	const handle = windows.fromSurface(surface);
	return finish(context, handle, 64, "ANativeWindow_fromSurface", {
		handle: handle.toString(),
		surface: surface.toString()
	});
}

function retain(context, windows) {
	const handle = argument(context, 0);
	const references = windows.acquire(handle);
	return finishVoid(context, "ANativeWindow_acquire", { handle: handle.toString(), references });
}

function release(context, windows, buffers) {
	const handle = argument(context, 0);
	const references = windows.release(handle);
	if (references === 0) buffers?.release(handle);
	return finishVoid(context, "ANativeWindow_release", { handle: handle.toString(), references });
}

function readProperty(context, windows, property) {
	const handle = argument(context, 0);
	const value = windows.require(handle)[property];
	return finish(context, BigInt.asUintN(32, BigInt(value)), 32, `ANativeWindow_get${capitalize(property)}`, {
		handle: handle.toString(),
		property,
		value
	});
}

function finish(context, value, width, operation, evidence) {
	context.registers.write(0, value, width, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...evidence, operation });
}

function finishVoid(context, operation, evidence) {
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...evidence, operation });
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function capitalize(value) {
	return value[0].toUpperCase() + value.slice(1);
}

function handlerError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
