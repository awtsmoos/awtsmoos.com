//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { NATIVE_EGL_CONFIG_VALUES } from "./nativeEglConfigState.js";
import { NATIVE_EGL_VALUES } from "./nativeEglDisplayState.js";

const MAXIMUM_ATTRIBUTE_PAIRS = 64;

/**
 * Registers bounded EGLConfig selection with exact five-argument AAPCS64 flow.
 * The Awtsmoos renews attribute pair, config slot, count cell, and X30 ray;
 * Awtsmoos.com measures guest memory before one deterministic config may stay.
 */
export function registerNativeEglConfigHandlers(registry, options) {
	registry.register("eglChooseConfig", context => chooseConfig(context, options));
}

function chooseConfig(context, options) {
	const display = argument(context, 0);
	const attributePointer = argument(context, 1);
	const configPointer = argument(context, 2);
	const capacity = Number(BigInt.asIntN(32, argument(context, 3)));
	const countPointer = argument(context, 4);
	const guestThread = thread(context);
	const attributes = readAttributes(context.memory, attributePointer);
	if (countPointer === 0n || capacity < 0) {
		options.displayState.recordError(guestThread, NATIVE_EGL_VALUES.BAD_PARAMETER);
		return finish(context, failure(), { attributePointer, capacity, configPointer, countPointer });
	}
	preflight(context.memory, countPointer, 4);
	if (configPointer !== 0n && capacity > 0) preflight(context.memory, configPointer, 8);
	const outcome = options.configState.choose(display, attributes, guestThread);
	if (outcome.success) {
		if (configPointer !== 0n && capacity > 0) {
			writeAarch64Integer(context.memory, configPointer, outcome.config, 64);
		}
		writeAarch64Integer(context.memory, countPointer, outcome.configCount, 32);
	}
	return finish(context, outcome, {
		attributePointer,
		attributes,
		capacity,
		configPointer,
		countPointer,
		display
	});
}

function readAttributes(memory, pointer) {
	if (pointer === 0n) return Object.freeze([]);
	const attributes = [];
	for (let index = 0; index < MAXIMUM_ATTRIBUTE_PAIRS; index += 1) {
		const address = pointer + BigInt(index * 8);
		const key = readAarch64Integer(memory, address, 32);
		if (Number(key) === NATIVE_EGL_CONFIG_VALUES.NONE) return Object.freeze(attributes);
		const rawValue = readAarch64Integer(memory, address + 4n, 32);
		attributes.push(Object.freeze({
			key: Number(key),
			value: Number(BigInt.asIntN(32, rawValue))
		}));
	}
	const error = new Error(`NATIVE_EGL_ATTRIBUTE_TERMINATOR:${pointer}`);
	error.code = "NATIVE_EGL_ATTRIBUTE_TERMINATOR";
	throw error;
}

function preflight(memory, pointer, size) {
	const bytes = memory.read(pointer, size);
	memory.write(pointer, bytes);
}

function failure() {
	return Object.freeze({
		attributes: Object.freeze([]),
		config: 0n,
		configCount: 0,
		error: NATIVE_EGL_VALUES.BAD_PARAMETER,
		result: 0n,
		success: false
	});
}

function finish(context, outcome, detail) {
	context.registers.write(0, outcome.result, 32, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		...detail,
		attributePointer: detail.attributePointer.toString(),
		attributes: Object.freeze((detail.attributes || []).map(item => Object.freeze({ ...item }))),
		config: outcome.config.toString(),
		configCount: outcome.configCount,
		configPointer: detail.configPointer.toString(),
		countPointer: detail.countPointer.toString(),
		display: detail.display?.toString() || null,
		error: outcome.error,
		operation: "eglChooseConfig",
		result: outcome.result.toString(),
		success: outcome.success
	});
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function thread(context) {
	return context.systemRegisters?.read("TPIDR_EL0") || 0n;
}
