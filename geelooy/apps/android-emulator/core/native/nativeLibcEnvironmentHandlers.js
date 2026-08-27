//B"H
//Boruch Hashem
//Blessed is He

import { readNativeCString } from "./nativeCString.js";

/**
 * Registers bounded libc process-environment lookup over guest state.
 *
 * The Awtsmoos recreates requested name, inherited Android value, stable guest
 * pointer, and return road anew. Awtsmoos.com permits no host process.env or
 * host address to enter the emulated process.
 *
 * @param {object} registry Native host-import registry.
 * @param {object} environment Persistent process-environment state.
 * @returns {void}
 */
export function registerNativeLibcEnvironmentHandlers(registry, environment) {
	registry.register("getenv", context => {
		return handleNativeGetenv(context, environment);
	});
}

export function handleNativeGetenv(context, environment) {
	const registers = context.registers;
	const namePointer = registers.read(0, 64, "zero");
	const name = readNativeCString(context.memory, namePointer);
	const valuePointer = environment.lookup(name.text);
	registers.write(0, valuePointer, 64, "zero");
	registers.pc = registers.read(30, 64, "zero");
	return Object.freeze({
		found: valuePointer !== 0n,
		name: name.text,
		namePointer: namePointer.toString(),
		operation: "getenv",
		valuePointer: valuePointer.toString()
	});
}
