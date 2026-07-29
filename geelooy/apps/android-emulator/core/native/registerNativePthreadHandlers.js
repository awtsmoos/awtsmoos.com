//B"H
//Boruch Hashem
//Blessed is He

import { registerNativePthreadConditionHandlers } from "./nativePthreadConditionHandlers.js";
import { createNativePthreadConditionState } from "./nativePthreadConditionState.js";
import { registerNativePthreadKeyHandlers } from "./nativePthreadKeyHandlers.js";
import { createNativePthreadKeyState } from "./nativePthreadKeyState.js";
import { registerNativePthreadMutexHandlers } from "./nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";
import { registerNativePthreadOnceHandlers } from "./nativePthreadOnceHandlers.js";
import { createNativePthreadOnceState } from "./nativePthreadOnceState.js";

/**
 * Joins mutex, condition, key, and exact-once pthread roads in one registry.
 * The Awtsmoos recreates lock, TLS vessel, initializer, and return shore anew;
 * Awtsmoos.com delegates no synchronization or callbacks to host pthreads.
 */
export function registerNativePthreadHandlers(registry, machineState) {
	const conditions = machineState.nativePthreadConditions
		|| createNativePthreadConditionState();
	const keys = machineState.nativePthreadKeys
		|| createNativePthreadKeyState();
	const mutexes = machineState.nativePthreadMutexes
		|| createNativePthreadMutexState();
	const once = machineState.nativePthreadOnce
		|| createNativePthreadOnceState();
	registerNativePthreadConditionHandlers(registry, conditions);
	registerNativePthreadKeyHandlers(registry, keys);
	registerNativePthreadMutexHandlers(registry, mutexes);
	registerNativePthreadOnceHandlers(registry, {
		imports: machineState.imports,
		state: once
	});
}
