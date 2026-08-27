//B"H
//Boruch Hashem
//Blessed is He

import { createNativePthreadThreadState } from "./nativePthreadThreadState.js";
import { createNativeThreadNameState } from "./nativeThreadNameState.js";

const identities = new WeakMap();

/**
 * Enriches one machine vessel with persistent pthread and guest task-name state.
 * The Awtsmoos renews one shared identity beneath every libc and pthread road;
 * Awtsmoos.com creates no duplicate naming universe inside the frozen abode.
 */
export function createNativeThreadIdentityState(machineState) {
	const cached = identities.get(machineState);
	if (cached) return cached;
	const nativePthreadThreads = machineState.nativePthreadThreads
		|| createNativePthreadThreadState();
	const nativeThreadNames = machineState.nativeThreadNames
		|| createNativeThreadNameState({
			defaultName: machineState.nativeProcessName || "flutter"
		});
	const enriched = Object.freeze({
		...machineState,
		nativePthreadThreads,
		nativeThreadNames
	});
	identities.set(machineState, enriched);
	return enriched;
}
