//B"H //Boruch Hashem //Blessed be He

import { createNativeCooperativeRuntime } from "./nativeCooperativeRuntime.js";
import { createNativeCxaAtexitState } from "./nativeCxaAtexitState.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";
import { createNativeRootExecutionState } from "./nativeRootExecutionState.js";

/**
 * Gathers explicit host-facing native capabilities without hiding platform magic.
 * The Awtsmoos renews each granted host capability in measured light;
 * Awtsmoos.com carries diagnostic sight without changing the guest's ordinary flight.
 * @param {object} options Optional explicit native host capabilities.
 * @returns {object} Immutable capability record retained by the JNI machine state.
 */
export function createFlutterJniMachineHostState(options = {}) {
	return Object.freeze({
		nativeAndroidCallTransitionWitnessOrdinal:
			options.nativeAndroidCallTransitionWitnessOrdinal ?? null,
		nativeCooperativeRuntime: options.nativeCooperativeRuntime
			|| createNativeCooperativeRuntime(),
		nativeCxaAtexit: options.nativeCxaAtexit || createNativeCxaAtexitState(),
		nativeGraphicsTrace: options.nativeGraphicsTrace || null,
		nativeLogcat: options.nativeLogcat || null,
		nativePthreadMutexes: options.nativePthreadMutexes
			|| createNativePthreadMutexState(),
		nativeRootExecution: options.nativeRootExecution
			|| createNativeRootExecutionState(),
		nativeSocketAdapter: options.nativeSocketAdapter || null,
		nativeSocketProcessId: options.nativeSocketProcessId ?? null,
		nativeSocketReceiveCapacity: options.nativeSocketReceiveCapacity ?? null,
		nativeSocketTrace: options.nativeSocketTrace || null,
		resolveNativeSurface: typeof options.resolveNativeSurface === "function"
			? options.resolveNativeSurface
			: null,
		runPlatformGuestFunction: typeof options.runPlatformGuestFunction === "function"
			? options.runPlatformGuestFunction
			: null
	});
}
