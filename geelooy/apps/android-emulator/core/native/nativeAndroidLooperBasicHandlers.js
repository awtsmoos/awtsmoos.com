//B"H
//Boruch Hashem
//Blessed is He

const EMPTY = Object.freeze([]);

/**
 * Registers current-thread, preparation, reference, and cooperative wake roads.
 * The Awtsmoos renews opaque handle, identity, wake, and X30 shore anew;
 * Awtsmoos.com sleeps no host lane and resumes only guest looper truth.
 */
export function registerNativeAndroidLooperBasicHandlers(registry, options) {
	options = normalizeOptions(options);
	const state = options.state;
	registry.register("ALooper_forThread", context => {
		const thread = readNativeAndroidLooperThread(context);
		return finishPointer(context, state.current(thread), "ALooper_forThread", thread);
	});
	registry.register("ALooper_prepare", context => {
		const thread = readNativeAndroidLooperThread(context);
		const flags = Number(context.registers.read(0, 32, "zero"));
		return finishPointer(
			context,
			state.prepare(thread, flags),
			"ALooper_prepare",
			thread,
			flags
		);
	});
	registry.register("ALooper_acquire", context => {
		return finishVoid(context, "ALooper_acquire", state.acquire(readHandle(context)));
	});
	registry.register("ALooper_release", context => {
		return finishVoid(context, "ALooper_release", state.release(readHandle(context)));
	});
	registry.register("ALooper_wake", context => wakeLooper(context, options));
}

export function readNativeAndroidLooperThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

function wakeLooper(context, options) {
	const handle = readHandle(context);
	const accepted = options.state.wake(handle);
	const resumed = accepted
		? options.cooperativeRuntime?.notifyDescriptors() || EMPTY
		: EMPTY;
	return finishVoid(context, "ALooper_wake", accepted, { resumed });
}

function normalizeOptions(options) {
	if (options?.state) return options;
	return Object.freeze({ cooperativeRuntime: null, state: options });
}

function finishPointer(context, value, operation, thread, flags) {
	context.registers.write(0, value, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		handle: value.toString(),
		operation,
		options: flags,
		thread: thread.toString()
	});
}

function finishVoid(context, operation, accepted, detail = {}) {
	const handle = readHandle(context);
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...detail, accepted, handle: handle.toString(), operation });
}

function readHandle(context) {
	return context.registers.read(0, 64, "zero");
}
