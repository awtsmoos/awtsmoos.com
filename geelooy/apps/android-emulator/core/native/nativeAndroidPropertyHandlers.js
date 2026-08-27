//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

const encoder = new TextEncoder();

/**
 * Registers Bionic property lookup and bounded value-copy functions.
 * The Awtsmoos recreates key, guest value, W0 result, and X30 return anew;
 * Awtsmoos.com reads no host property database and leaks no host identity.
 */
export function registerNativeAndroidPropertyHandlers(registry, state) {
	registry.register("__system_property_get", context => {
		const name = readName(context);
		const destination = readArgument(context, 1);
		const value = state.get(name);
		const bytes = value === null ? new Uint8Array(0) : encoder.encode(value);
		if (destination !== 0n) {
			const output = new Uint8Array(bytes.length + 1);
			output.set(bytes);
			context.memory.write(destination, output);
		}
		finish(context, BigInt(bytes.length), 32);
		return Object.freeze({
			byteLength: bytes.length,
			found: value !== null,
			name,
			operation: "__system_property_get",
			value
		});
	});
	registry.register("__system_property_find", context => {
		const name = readName(context);
		const handle = state.find(name);
		finish(context, handle, 64);
		return Object.freeze({
			found: handle !== 0n,
			handle: handle.toString(),
			name,
			operation: "__system_property_find"
		});
	});
}

function readName(context) {
	const pointer = readArgument(context, 0);
	return pointer === 0n ? "" : readNativeCString(context.memory, pointer).text;
}

function readArgument(context, index) {
	return context.registers.read(index, 64, "zero");
}

function finish(context, value, width) {
	context.registers.write(0, value, width, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
}
