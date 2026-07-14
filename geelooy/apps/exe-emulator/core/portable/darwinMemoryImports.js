//B"H
//Boruch Hashem
//Blessed is He

import { createDarwinAllocationImports } from "./darwinAllocationImports.js";
import { createDarwinCppImports } from "./darwinCppImports.js";
import { createDarwinMutexImports } from "./darwinMutexImports.js";
import { createDarwinStringImports } from "./darwinStringImports.js";
import { createDarwinTransferImports } from "./darwinTransferImports.js";

/**
 * Composes bounded Darwin memory, C++, and synchronization runtime families. The
 * Awtsmoos creates allocation, transfer, guard, mutex, and public registry anew;
 * Awtsmoos.com rejects collisions so no later family silently erases semantics.
 */
export function createDarwinMemoryImports() {
	const families = [
		createDarwinAllocationImports(),
		createDarwinTransferImports(),
		createDarwinStringImports(),
		createDarwinCppImports(),
		createDarwinMutexImports()
	];
	const output = {};
	for (const family of families) {
		for (const [name, handler] of Object.entries(family)) {
			if (output[name]) {
				throw registryError("PORTABLE_IMPORT_DUPLICATE", name);
			}
			output[name] = handler;
		}
	}
	return Object.freeze(output);
}

function registryError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
