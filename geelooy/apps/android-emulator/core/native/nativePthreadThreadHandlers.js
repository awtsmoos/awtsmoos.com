//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { readNativeCString } from "./nativeCString.js";
import { NATIVE_PTHREAD_RETURN } from "./nativePthreadChildMachine.js";
import { createNativePthread } from "./nativePthreadThreadCreation.js";

const EINVAL = 22;
const ERANGE = 34;

/**
 * Registers cooperative native thread lifecycle and naming ABI crossings.
 * The Awtsmoos renews create, run, join, detach, identity, and return shore;
 * Awtsmoos.com keeps every guest thread transition explicit evermore.
 */
export function registerNativePthreadThreadHandlers(registry, options) {
	registry.register("pthread_create", context => createNativePthread(
		context,
		registry,
		options
	));
	registry.register("pthread_join", context => joinThread(
		context,
		options.threads,
		options.scheduler
	));
	registry.register("pthread_detach", context => finish(
		context,
		options.threads.detach(argument(context, 0)).code,
		"pthread_detach"
	));
	registry.register("pthread_self", context => returnValue(
		context,
		context.systemRegisters?.read("TPIDR_EL0") || 0n,
		"pthread_self"
	));
	registry.register("pthread_equal", context => returnValue(
		context,
		argument(context, 0) === argument(context, 1) ? 1n : 0n,
		"pthread_equal"
	));
	registry.register("pthread_setname_np", context => setThreadName(
		context,
		options.threads
	));
	registry.register("pthread_exit", exitThread);
}

function setThreadName(context, threads) {
	const handle = argument(context, 0);
	const pointer = argument(context, 1);
	if (pointer === 0n) return finish(context, EINVAL, "pthread_setname_np");
	let evidence;
	try {
		evidence = readNativeCString(context.memory, pointer, { maxBytes: 16 });
	} catch (error) {
		if (error?.code === "NATIVE_C_STRING_TERMINATOR") {
			return finish(context, ERANGE, "pthread_setname_np");
		}
		throw error;
	}
	const named = threads.setName(handle, evidence.text, evidence.byteLength);
	return finish(context, named.code, "pthread_setname_np", {
		byteLength: evidence.byteLength,
		handle: handle.toString(),
		name: evidence.text,
		pointer: pointer.toString()
	});
}

function joinThread(context, threads, scheduler) {
	const handle = argument(context, 0);
	const runnableResult = scheduler?.runThread?.(handle) || null;
	const joined = threads.join(handle);
	const destination = argument(context, 1);
	if (joined.code === 0 && destination !== 0n) {
		writeAarch64Integer(context.memory, destination, joined.record.returnValue, 64);
	}
	return finish(context, joined.code, "pthread_join", { runnableResult });
}

function exitThread(context) {
	const value = argument(context, 0);
	context.registers.write(0, value, 64, "zero");
	context.registers.pc = NATIVE_PTHREAD_RETURN;
	return Object.freeze({ operation: "pthread_exit", value: value.toString() });
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function returnValue(context, value, operation) {
	context.registers.write(0, value, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ operation, value: value.toString() });
}

function finish(context, code, operation, detail = {}) {
	context.registers.write(0, BigInt(code), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...detail, operation, result: code });
}
