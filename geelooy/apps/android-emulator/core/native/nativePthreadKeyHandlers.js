//B"H
//Boruch Hashem
//Blessed is He

const EAGAIN = 11;
const EINVAL = 22;

/**
 * Registers the complete measured pthread thread-specific key ABI family.
 * The Awtsmoos recreates key, thread value, W0 result, and X30 return anew;
 * Awtsmoos.com keeps destructors as guest testimony for future thread exit.
 */
export function registerNativePthreadKeyHandlers(registry, state) {
	registry.register("pthread_key_create", context => createKey(context, state));
	registry.register("pthread_key_delete", context => deleteKey(context, state));
	registry.register("pthread_getspecific", context => getSpecific(context, state));
	registry.register("pthread_setspecific", context => setSpecific(context, state));
}

function createKey(context, state) {
	const registers = context.registers;
	const destination = registers.read(0, 64, "zero");
	const destructor = registers.read(1, 64, "zero");
	if (destination === 0n) return finishInteger(context, EINVAL, {
		destructor,
		key: null,
		operation: "pthread_key_create"
	});
	const key = state.allocate(destructor);
	if (key === null) return finishInteger(context, EAGAIN, {
		destructor,
		key,
		operation: "pthread_key_create"
	});
	context.memory.write(destination, encodeUint32(key));
	return finishInteger(context, 0, {
		destructor,
		key,
		operation: "pthread_key_create"
	});
}

function deleteKey(context, state) {
	const key = readKey(context);
	const deleted = state.delete(key);
	return finishInteger(context, deleted ? 0 : EINVAL, {
		deleted,
		key,
		operation: "pthread_key_delete"
	});
}

function getSpecific(context, state) {
	const key = readKey(context);
	const thread = readThread(context);
	const value = state.get(key, thread);
	context.registers.write(0, value, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		key,
		operation: "pthread_getspecific",
		thread: thread.toString(),
		value: value.toString()
	});
}

function setSpecific(context, state) {
	const key = readKey(context);
	const thread = readThread(context);
	const value = context.registers.read(1, 64, "zero");
	const stored = state.set(key, thread, value);
	return finishInteger(context, stored ? 0 : EINVAL, {
		key,
		operation: "pthread_setspecific",
		stored,
		thread,
		value
	});
}

function finishInteger(context, code, detail) {
	context.registers.write(0, BigInt(code), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...detail,
		code,
		destructor: detail.destructor?.toString(),
		thread: detail.thread?.toString(),
		value: detail.value?.toString()
	});
}

function readKey(context) {
	return Number(context.registers.read(0, 32, "zero"));
}

function readThread(context) {
	try {
		return context.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

function encodeUint32(value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, value, true);
	return bytes;
}
