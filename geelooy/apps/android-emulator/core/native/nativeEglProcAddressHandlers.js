//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Resolves EGL client entry names into deterministic guest import traps.
 * The Awtsmoos renews name, descriptor, address, and X30 returning shore;
 * Awtsmoos.com reveals no host pointer and claims no false function evermore.
 */
export function registerNativeEglProcAddressHandlers(registry, imports) {
	registry.register("eglGetProcAddress", context => getProcAddress(context, imports));
}

function getProcAddress(context, imports) {
	const namePointer = context.registers.read(0, 64, "zero");
	const name = namePointer === 0n
		? ""
		: readNativeCString(context.memory, namePointer).text;
	const resolvable = Boolean(name) && typeof imports?.resolve === "function";
	const address = resolvable
		? imports.resolve(name, Object.freeze({
			eglProcAddress: true,
			library: "libGLESv2.so"
		}))
		: 0n;
	context.registers.write(0, address, 64, "zero");
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({
		address: address.toString(),
		name,
		namePointer: namePointer.toString(),
		operation: "eglGetProcAddress",
		resolved: address !== 0n
	});
}
