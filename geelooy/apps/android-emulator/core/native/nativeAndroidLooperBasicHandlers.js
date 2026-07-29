//B"H
//Boruch Hashem
//Blessed is He

/**
 * Registers current-thread, preparation, reference, and wake ALooper functions.
 * The Awtsmoos recreates opaque handle, thread identity, and X30 road anew;
 * Awtsmoos.com sleeps no host lane and fabricates no host looper object.
 */
export function registerNativeAndroidLooperBasicHandlers(registry, state) {
	registry.register("ALooper_forThread", context => {
		const thread = readNativeAndroidLooperThread(context);
		return finishPointer(
			context,
			state.current(thread),
			"ALooper_forThread",
			thread
		);
	});
	registry.register("ALooper_prepare", context => {
		const thread = readNativeAndroidLooperThread(context);
		const options = Number(context.registers.read(0, 32, "zero"));
		return finishPointer(
			context,
			state.prepare(thread, options),
			"ALooper_prepare",
			thread,
			options
		);
	});
	registry.register("ALooper_acquire", context => {
		return finishVoid(context, "ALooper_acquire", state.acquire(readHandle(context)));
	});
	registry.register("ALooper_release", context => {
		return finishVoid(context, "ALooper_release", state.release(readHandle(context)));
	});
	registry.register("ALooper_wake", context => {
		return finishVoid(context, "ALooper_wake", state.wake(readHandle(context)));
	});
}

export function readNativeAndroidLooperThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

function finishPointer(context, value, operation, thread, options) {
	context.registers.write(0, value, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		handle: value.toString(),
		operation,
		options,
		thread: thread.toString()
	});
}

function finishVoid(context, operation, accepted) {
	const handle = readHandle(context);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ accepted, handle: handle.toString(), operation });
}

function readHandle(context) {
	return context.registers.read(0, 64, "zero");
}
