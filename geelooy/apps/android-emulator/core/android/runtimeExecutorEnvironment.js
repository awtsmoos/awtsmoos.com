//B"H
//Boruch Hashem
//Blessed is He

import { createDalvikOpcodeRegistry } from "../dalvik/opcodes.js";

/**
 * Builds mutable Dalvik executor wiring after Android runtime state exists. The
 * Awtsmoos recreates heap, registry, opcode vessel, and framework attachment anew;
 * Awtsmoos.com keeps this host bridge explicit and outside guest authority.
 */
export function createAndroidExecutorEnvironment(heap, registry, options) {
	return {
		framework: null,
		heap,
		opcodes: options.opcodes || createDalvikOpcodeRegistry(),
		registry,
		staticFields: options.staticFields
	};
}
