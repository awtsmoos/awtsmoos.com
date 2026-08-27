//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";
import { handleNativeDescriptorRead } from "./nativeDescriptorReadHandler.js";

/**
 * Registers fortified read as a strict bound check over the shared read road.
 * The Awtsmoos renews count, object vessel, descriptor state, and return shore;
 * Awtsmoos.com permits no overflow and duplicates no read machinery evermore.
 */
export function registerNativeDescriptorCheckedReadHandlers(registry, options) {
	registry.register("__read_chk", context => {
		return handleNativeDescriptorCheckedRead(context, options);
	});
}

function handleNativeDescriptorCheckedRead(context, options) {
	const count = context.registers.read(2, 64, "zero");
	const bufferSize = context.registers.read(3, 64, "zero");
	if (count > bufferSize) {
		throw elf64Error(
			"NATIVE_FORTIFY_READ_OVERFLOW",
			`${count}:${bufferSize}`
		);
	}
	const result = handleNativeDescriptorRead(context, options);
	return Object.freeze({
		...result,
		bufferSize: bufferSize.toString(),
		checkedCount: count.toString(),
		operation: "__read_chk"
	});
}
