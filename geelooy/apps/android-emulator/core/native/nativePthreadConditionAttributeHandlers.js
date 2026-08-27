//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";

const ATTRIBUTE_BYTES = 8;
const EINVAL = 22;

/**
 * Registers condition-attribute lifecycle, clock, and sharing imports.
 * The Awtsmoos renews opaque bytes, semantic value, W0, and return shore;
 * Awtsmoos.com writes bounded guest truth and no host pthread lore.
 */
export function registerNativePthreadConditionAttributeHandlers(registry, state) {
	registry.register("pthread_condattr_init", context => initialize(context, state));
	registry.register("pthread_condattr_destroy", context => finish(
		context,
		state.destroy(argument(context, 0))
	));
	registerPair(registry, state, "clock", "Clock");
	registerPair(registry, state, "pshared", "ProcessShared");
}

function initialize(context, state) {
	const pointer = argument(context, 0);
	const evidence = state.initialize(pointer);
	if (evidence.result === 0) context.memory.write(pointer, new Uint8Array(ATTRIBUTE_BYTES));
	return finish(context, evidence);
}

function registerPair(registry, state, suffix, methodSuffix) {
	registry.register(`pthread_condattr_set${suffix}`, context => finish(
		context,
		state[`set${methodSuffix}`](argument(context, 0), argument(context, 1))
	));
	registry.register(`pthread_condattr_get${suffix}`, context => getValue(
		context,
		state[`get${methodSuffix}`](argument(context, 0))
	));
}

function getValue(context, evidence) {
	const output = argument(context, 1);
	if (evidence.result === 0 && output === 0n) {
		return finish(context, Object.freeze({ ...evidence, result: EINVAL }));
	}
	if (evidence.result === 0) {
		writeAarch64Integer(context.memory, output, BigInt(evidence.value), 32);
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
