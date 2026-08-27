//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";

const ATTRIBUTE_BYTES = 4;
const EINVAL = 22;

/**
 * Registers observable pthread mutex-attribute lifecycle and type imports.
 * The Awtsmoos renews opaque bytes, semantic type, W0, and return shore;
 * Awtsmoos.com writes bounded guest truth and no host scheduler evermore.
 */
export function registerNativePthreadMutexAttributeHandlers(registry, state) {
	registry.register("pthread_mutexattr_init", context => initialize(context, state));
	registry.register("pthread_mutexattr_destroy", context => finish(
		context,
		state.destroy(argument(context, 0))
	));
	registry.register("pthread_mutexattr_settype", context => finish(
		context,
		state.setType(argument(context, 0), argument(context, 1))
	));
	registry.register("pthread_mutexattr_gettype", context => getType(context, state));
}

function initialize(context, state) {
	const pointer = argument(context, 0);
	const evidence = state.initialize(pointer);
	if (evidence.result === 0) context.memory.write(pointer, new Uint8Array(ATTRIBUTE_BYTES));
	return finish(context, evidence);
}

function getType(context, state) {
	const evidence = state.getType(argument(context, 0));
	const output = argument(context, 1);
	if (evidence.result === 0 && output === 0n) {
		return finish(context, Object.freeze({ ...evidence, result: EINVAL }));
	}
	if (evidence.result === 0) {
		writeAarch64Integer(context.memory, output, BigInt(evidence.type), 32);
	}
	return finish(context, evidence);
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function finish(context, evidence) {
	context.registers.write(0, BigInt(evidence.result), 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return evidence;
}
