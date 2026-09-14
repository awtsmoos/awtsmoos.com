//B"H
//Boruch Hashem
//Blessed be He

import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";

/**
 * Creates the persistent JNI machine identity used by platform-loop fixtures.
 * The helper mirrors production's root TLS/stack shape without creating a fake
 * pthread record or replacing the shared guest memory/import address spaces.
 *
 * @param {object} options Memory, imports, stack pointer, and TLS thread identity.
 * @returns {object} Frozen minimum machine state accepted by the production pump.
 */
export function createPlatformPumpMachineState(options) {
	return Object.freeze({
		imports: options.imports,
		memory: options.memory,
		stack: Object.freeze({
			end: BigInt(options.stack).toString()
		}),
		systemRegisters: createAarch64SystemRegisters({
			TPIDR_EL0: BigInt(options.thread)
		}),
		thread: Object.freeze({
			pointer: BigInt(options.thread).toString()
		})
	});
}
