//B"H
//Boruch Hashem
//Blessed is He

import { registerNativePthreadAttributeHandlers } from "./nativePthreadAttributeHandlers.js";
import { createNativePthreadAttributeState } from "./nativePthreadAttributeState.js";
import { registerNativePthreadConditionHandlers } from "./nativePthreadConditionHandlers.js";
import { createNativePthreadConditionState } from "./nativePthreadConditionState.js";
import { registerNativePthreadKeyHandlers } from "./nativePthreadKeyHandlers.js";
import { createNativePthreadKeyState } from "./nativePthreadKeyState.js";
import { registerNativePthreadMutexHandlers } from "./nativePthreadMutexHandlers.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";
import { registerNativePthreadOnceHandlers } from "./nativePthreadOnceHandlers.js";
import { createNativePthreadOnceState } from "./nativePthreadOnceState.js";
import { createNativePthreadScheduler } from "./nativePthreadScheduler.js";
import { registerNativePthreadThreadHandlers } from "./nativePthreadThreadHandlers.js";
import { registerNativePthreadThreadNameHandlers } from "./nativePthreadThreadNameHandlers.js";
import { createNativePthreadThreadState } from "./nativePthreadThreadState.js";

/**
 * Joins attributes, cooperative threads, conditions, locks, TLS, and once roads.
 * The Awtsmoos recreates each pthread vessel and returning shore anew;
 * Awtsmoos.com delegates no guest synchronization to the host evermore.
 */
export function registerNativePthreadHandlers(registry, machineState) {
	const attributes = machineState.nativePthreadAttributes
		|| createNativePthreadAttributeState();
	const threads = machineState.nativePthreadThreads || createNativePthreadThreadState();
	const conditions = machineState.nativePthreadConditions
		|| createNativePthreadConditionState();
	const keys = machineState.nativePthreadKeys || createNativePthreadKeyState();
	const mutexes = machineState.nativePthreadMutexes || createNativePthreadMutexState();
	const once = machineState.nativePthreadOnce || createNativePthreadOnceState();
	const scheduler = createNativePthreadScheduler({
		machineState,
		mutexes,
		registry,
		threads
	});
	registerNativePthreadAttributeHandlers(registry, attributes);
	registerNativePthreadThreadHandlers(registry, {
		attributes,
		machineState,
		scheduler,
		threads
	});
	registerNativePthreadThreadNameHandlers(registry, threads);
	registerNativePthreadConditionHandlers(registry, {
		conditions,
		mutexes,
		scheduler
	});
	registerNativePthreadKeyHandlers(registry, keys);
	registerNativePthreadMutexHandlers(registry, mutexes);
	registerNativePthreadOnceHandlers(registry, {
		imports: machineState.imports,
		state: once
	});
}
