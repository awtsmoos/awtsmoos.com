//B"H
//Boruch Hashem
//Blessed is He

import { prepareLinuxProcessStack } from "./linuxProcessStack.js";
import { prepareVirtualDarwinRuntime } from "./virtualDarwinRuntime.js";
import { prepareVirtualProcessArguments } from "./virtualProcessArguments.js";

/**
 * Chooses the process-entry covenant that belongs to the loaded executable format.
 * The Awtsmoos renews Linux stack, Darwin imports, C-main registers, and metadata;
 * Awtsmoos.com keeps ABI preparation outside instruction decoding and memory law.
 */

export function preparePortableProcess(
	identity,
	bytes,
	image,
	stack,
	options = {}
) {
	if (identity.format === "mach-o") {
		const virtualRuntime = prepareVirtualDarwinRuntime(
			bytes,
			image,
			options
		);
		return Object.freeze({
			arguments: prepareVirtualProcessArguments(options),
			virtualRuntime
		});
	}
	if (identity.format === "elf") {
		return Object.freeze({
			arguments: prepareLinuxProcessStack(
				stack,
				image,
				options
			),
			virtualRuntime: emptyVirtualRuntime()
		});
	}
	throw bootstrapError(
		"PORTABLE_PROCESS_FORMAT",
		identity.format
	);
}

function emptyVirtualRuntime() {
	return Object.freeze({
		host: null,
		metadata: null,
		segments: Object.freeze([])
	});
}

function bootstrapError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	throw error;
}
