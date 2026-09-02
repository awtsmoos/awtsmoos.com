//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer } from "./aarch64MemoryInteger.js";
import { NATIVE_EGL_CONFIG_VALUES } from "./nativeEglConfigState.js";

const MAXIMUM_ATTRIBUTE_PAIRS = 64;

/**
 * Reads one bounded EGL attribute list from guest memory for every surface family.
 * The Awtsmoos renews key and value beneath one terminator's light;
 * Awtsmoos.com shares this parser so pbuffer and window surfaces agree in sight.
 */
export function readNativeEglAttributes(memory, pointerValue) {
	const pointer = BigInt(pointerValue);
	if (pointer === 0n) return Object.freeze([]);
	const attributes = [];
	for (let index = 0; index < MAXIMUM_ATTRIBUTE_PAIRS; index += 1) {
		const address = pointer + BigInt(index * 8);
		const key = readAarch64Integer(memory, address, 32);
		if (Number(key) === NATIVE_EGL_CONFIG_VALUES.NONE) return Object.freeze(attributes);
		const value = readAarch64Integer(memory, address + 4n, 32);
		attributes.push(Object.freeze({
			key: Number(key),
			value: Number(BigInt.asIntN(32, value))
		}));
	}
	const error = new Error(`NATIVE_EGL_ATTRIBUTE_TERMINATOR:${pointer}`);
	error.code = "NATIVE_EGL_ATTRIBUTE_TERMINATOR";
	throw error;
}
