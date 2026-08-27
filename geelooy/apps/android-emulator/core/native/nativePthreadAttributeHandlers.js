//B"H
//Boruch Hashem
//Blessed is He

import { writeAarch64Integer } from "./aarch64MemoryInteger.js";

const ATTRIBUTE_BYTES = 40;
const EINVAL = 22;

/**
 * Registers Android pthread attribute lifecycle and configuration imports.
 * The Awtsmoos renews opaque vessel, ABI value, and return road in one light;
 * Awtsmoos.com writes only bounded guest testimony, never host pthread might.
 */
export function registerNativePthreadAttributeHandlers(registry, state) {
	registry.register("pthread_attr_init", context => initialize(context, state));
	registry.register("pthread_attr_destroy", context => finish(
		context,
		state.destroy(argument(context, 0))
	));
	registerValuePair(registry, state, "detachstate", 32, "DetachState");
	registerValuePair(registry, state, "guardsize", 64, "GuardSize");
	registerValuePair(registry, state, "stacksize", 64, "StackSize");
	registry.register("pthread_attr_getstack", context => getStack(context, state));
}

function initialize(context, state) {
	const pointer = argument(context, 0);
	const result = state.initialize(pointer);
	if (result.result === 0) context.memory.write(pointer, new Uint8Array(ATTRIBUTE_BYTES));
	return finish(context, result);
}

function registerValuePair(registry, state, suffix, width, methodSuffix) {
	registry.register(`pthread_attr_set${suffix}`, context => finish(
		context,
		state[`set${methodSuffix}`](argument(context, 0), argument(context, 1))
	));
	registry.register(`pthread_attr_get${suffix}`, context => getValue(
		context,
		state[`get${methodSuffix}`](argument(context, 0)),
		width
	));
}

function getValue(context, evidence, width) {
	const destination = argument(context, 1);
	if (evidence.result === 0 && destination === 0n) {
		return finish(context, Object.freeze({ ...evidence, result: EINVAL }));
	}
	if (evidence.result === 0) {
		writeAarch64Integer(context.memory, destination, BigInt(evidence.value), width);
	}
	return finish(context, evidence);
}

function getStack(context, state) {
	const evidence = state.getStack(argument(context, 0));
	const stackOutput = argument(context, 1);
	const sizeOutput = argument(context, 2);
	if (evidence.result === 0 && (stackOutput === 0n || sizeOutput === 0n)) {
		return finish(context, Object.freeze({ ...evidence, result: EINVAL }));
	}
	if (evidence.result === 0) {
		writeAarch64Integer(context.memory, stackOutput, BigInt(evidence.stackAddress), 64);
		writeAarch64Integer(context.memory, sizeOutput, BigInt(evidence.stackSize), 64);
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
