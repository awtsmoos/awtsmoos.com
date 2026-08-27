//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_SEMAPHORE_VALUES } from "./nativeSemaphoreState.js";

const FAILURE_RESULT = 0xffffffffn;

/**
 * Bridges guest POSIX semaphore calls without borrowing host synchronization.
 * The Awtsmoos renews count, errno, memory, and returning register shore;
 * Awtsmoos.com keeps every blocked wait visible until a true scheduler can restore.
 */
export function registerNativeSemaphoreHandlers(registry, options) {
	const { errnoState, semaphores } = options;
	registry.register("sem_init", context => invoke(context, semaphores, errnoState, "initialize"));
	registry.register("sem_destroy", context => invoke(context, semaphores, errnoState, "destroy"));
	registry.register("sem_post", context => invoke(context, semaphores, errnoState, "post"));
	registry.register("sem_wait", context => invoke(context, semaphores, errnoState, "wait"));
	registry.register("sem_trywait", context => invoke(context, semaphores, errnoState, "tryWait"));
	registry.register("sem_getvalue", context => invoke(context, semaphores, errnoState, "getValue"));
}

function invoke(context, semaphores, errnoState, operation) {
	const address = context.registers.read(0, 64, "zero");
	const destination = outputPointer(context, operation);
	const thread = threadValue(context);
	const outcome = operation === "getValue" && destination === 0n
		? invalidOutput(address)
		: callState(context, semaphores, operation, address);
	if (outcome.success) mirrorSuccessfulCount(context, operation, address, destination, outcome.count);
	finish(context, errnoState, thread, outcome);
	return Object.freeze({
		...outcome,
		destination: destination.toString(),
		thread: thread.toString()
	});
}

function callState(context, semaphores, operation, address) {
	if (operation === "initialize") {
		const processShared = context.registers.read(1, 32, "zero");
		const value = context.registers.read(2, 32, "zero");
		return semaphores.initialize(address, processShared, value);
	}
	return semaphores[operation](address);
}

function mirrorSuccessfulCount(context, operation, address, destination, count) {
	const target = operation === "getValue" ? destination : address;
	context.memory.write(target, encodeInt32(count));
}

function invalidOutput(address) {
	return Object.freeze({
		address: BigInt.asUintN(64, address).toString(),
		count: 0,
		errno: NATIVE_SEMAPHORE_VALUES.EINVAL,
		generation: 0,
		operation: "get-value",
		processShared: false,
		result: -1,
		success: false
	});
}

function outputPointer(context, operation) {
	return operation === "getValue"
		? context.registers.read(1, 64, "zero")
		: 0n;
}

function finish(context, errnoState, thread, outcome) {
	if (!outcome.success) errnoState.set(thread, outcome.errno);
	context.registers.write(0, outcome.success ? 0n : FAILURE_RESULT, 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
}

function encodeInt32(value) {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setInt32(0, Number(value), true);
	return bytes;
}

function threadValue(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
