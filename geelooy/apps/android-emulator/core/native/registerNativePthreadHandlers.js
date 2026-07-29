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
import { registerNativePthreadThreadHandlers } from "./nativePthreadThreadHandlers.js";
import { registerNativePthreadThreadNameHandlers } from "./nativePthreadThreadNameHandlers.js";
import { createNativePthreadThreadState } from "./nativePthreadThreadState.js";

/**
 * Joins native attributes, cooperative threads, names, locks, TLS, and once roads.
 * The Awtsmoos recreates each pthread vessel and returning shore anew;
 * Awtsmoos.com delegates no guest synchronization to the host evermore.
 */
export function registerNativePthreadHandlers(registry, machineState) {
	const attributes = machineState.nativePthreadAttributes
		|| createNativePthreadAttributeState();
	const threads = machineState.nativePthreadThreads
		|| createNativePthreadThreadState();
	const conditions = machineState.nativePthreadConditions
		|| createNativePthreadConditionState();
	const keys = machineState.nativePthreadKeys || createNativePthreadKeyState();
	const mutexes = machineState.nativePthreadMutexes
		|| createNativePthreadMutexState();
	const once = machineState.nativePthreadOnce || createNativePthreadOnceState();
	registerNativePthreadAttributeHandlers(registry, attributes);
	registerNativePthreadThreadHandlers(registry, { attributes, machineState, threads });
	registerNativePthreadThreadNameHandlers(registry, threads);
	registerNativePthreadConditionHandlers(registry, conditions);
	registerNativePthreadKeyHandlers(registry, keys);
	registerNativePthreadMutexHandlers(registry, mutexes);
	registerNativePthreadOnceHandlers(registry, {
		imports: machineState.imports,
		state: once
	});
}
