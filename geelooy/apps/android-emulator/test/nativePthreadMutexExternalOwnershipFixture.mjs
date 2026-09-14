//B"H
//Boruch Hashem
//Blessed be He

import { createAarch64Registers } from "../core/native/aarch64Registers.js";
import { createAarch64SystemRegisters } from "../core/native/aarch64SystemRegisters.js";
import { createNativeHostImportRegistry } from "../core/native/nativeHostImportRegistry.js";
import { registerNativePthreadMutexHandlers } from "../core/native/nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "../core/native/nativePthreadMutexState.js";
import { createNativePthreadScheduler } from "../core/native/nativePthreadScheduler.js";
import { createNativePthreadThreadState } from "../core/native/nativePthreadThreadState.js";

export const EXTERNAL_MUTEX = 0x6000n;
export const EXTERNAL_OWNER = 0x7000n;
export const EXTERNAL_ROOT = 0x6fffe0000000n;
export const EXTERNAL_RETURN = 0x9999n;
export const VALID_WAITER = 0x8100n;
export const STALE_WAITER = EXTERNAL_ROOT;

/**
 * Builds the exact root-vs-managed mutex ownership boundary used by production.
 * The root TLS identity deliberately has no pthread thread-state record.
 */
export function createExternalMutexOwnershipFixture() {
	const mutexes = createNativePthreadMutexState();
	mutexes.initialize(EXTERNAL_MUTEX, { processShared: 0, type: 0 });
	mutexes.lock(EXTERNAL_MUTEX, EXTERNAL_OWNER);
	const registry = createNativeHostImportRegistry();
	const threads = createNativePthreadThreadState();
	const scheduler = createNativePthreadScheduler({
		machineState: Object.freeze({}),
		mutexes,
		registry,
		threads
	});
	registerNativePthreadMutexHandlers(registry, {
		attributes: null,
		mutexes,
		scheduler
	});
	return Object.freeze({
		invoke(name, thread) {
			const registers = createAarch64Registers({ programCounter: 1n });
			registers.write(0, EXTERNAL_MUTEX);
			registers.write(30, EXTERNAL_RETURN);
			const handled = registry.handle({ name }, {
				registers,
				systemRegisters: createAarch64SystemRegisters({
					TPIDR_EL0: BigInt(thread)
				})
			});
			return Object.freeze({ handled, registers });
		},
		mutexes,
		scheduler,
		threads
	});
}
