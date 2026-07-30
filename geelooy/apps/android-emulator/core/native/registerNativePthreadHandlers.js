//B"H
//Boruch Hashem
//Blessed is He

import { registerNativePthreadAttributeHandlers } from "./nativePthreadAttributeHandlers.js";
import { createNativePthreadAttributeState } from "./nativePthreadAttributeState.js";
import { registerNativePthreadConditionAttributeHandlers } from "./nativePthreadConditionAttributeHandlers.js";
import { createNativePthreadConditionAttributeState } from "./nativePthreadConditionAttributeState.js";
import { registerNativePthreadConditionHandlers } from "./nativePthreadConditionHandlers.js";
import { createNativePthreadConditionState } from "./nativePthreadConditionState.js";
import { registerNativePthreadKeyHandlers } from "./nativePthreadKeyHandlers.js";
import { createNativePthreadKeyState } from "./nativePthreadKeyState.js";
import { registerNativePthreadMutexAttributeHandlers } from "./nativePthreadMutexAttributeHandlers.js";
import { createNativePthreadMutexAttributeState } from "./nativePthreadMutexAttributeState.js";
import { registerNativePthreadMutexHandlers } from "./nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";
import { registerNativePthreadOnceHandlers } from "./nativePthreadOnceHandlers.js";
import { createNativePthreadOnceState } from "./nativePthreadOnceState.js";
import { createNativePthreadScheduler } from "./nativePthreadScheduler.js";
import { registerNativePthreadThreadHandlers } from "./nativePthreadThreadHandlers.js";
import { registerNativePthreadThreadNameHandlers } from "./nativePthreadThreadNameHandlers.js";
import { createNativePthreadThreadState } from "./nativePthreadThreadState.js";

/**
 * Joins conditions, typed locks, cooperative waits, TLS, threads, and once.
 * The Awtsmoos recreates each pthread vessel and returning shore anew;
 * Awtsmoos.com delegates no guest synchronization to the host evermore.
 */
export function registerNativePthreadHandlers(registry, machineState) {
	const attributes = machineState.nativePthreadAttributes || createNativePthreadAttributeState();
	const conditionAttributes = machineState.nativePthreadConditionAttributes || createNativePthreadConditionAttributeState();
	const mutexAttributes = machineState.nativePthreadMutexAttributes || createNativePthreadMutexAttributeState();
	const threads = machineState.nativePthreadThreads || createNativePthreadThreadState();
	const conditions = machineState.nativePthreadConditions || createNativePthreadConditionState();
	const keys = machineState.nativePthreadKeys || createNativePthreadKeyState();
	const mutexes = machineState.nativePthreadMutexes || createNativePthreadMutexState();
	const once = machineState.nativePthreadOnce || createNativePthreadOnceState();
	const scheduler = createNativePthreadScheduler({
		machineState,
		mutexes,
		registry,
		runtime: machineState.nativeCooperativeRuntime,
		threads
	});
	machineState.nativeCooperativeRuntime?.bindScheduler(scheduler);
	registerNativePthreadAttributeHandlers(registry, attributes);
	registerNativePthreadConditionAttributeHandlers(registry, conditionAttributes);
	registerNativePthreadMutexAttributeHandlers(registry, mutexAttributes);
	registerNativePthreadThreadHandlers(registry, { attributes, machineState, scheduler, threads });
	registerNativePthreadThreadNameHandlers(registry, threads);
	registerNativePthreadConditionHandlers(registry, { attributes: conditionAttributes, conditions, mutexes, scheduler });
	registerNativePthreadKeyHandlers(registry, keys);
	registerNativePthreadMutexHandlers(registry, { attributes: mutexAttributes, mutexes });
	registerNativePthreadOnceHandlers(registry, { imports: machineState.imports, state: once });
}
