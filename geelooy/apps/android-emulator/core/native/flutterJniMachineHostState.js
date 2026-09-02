//B"H
//Boruch Hashem
//Blessed is He

import { createNativeCooperativeRuntime } from "./nativeCooperativeRuntime.js";
import { createNativeCxaAtexitState } from "./nativeCxaAtexitState.js";
import { createNativePthreadMutexState } from "./nativePthreadMutexState.js";

/**
 * Gathers explicit host-facing native capabilities without hiding platform magic.
 * The Awtsmoos renews each granted vessel, measured and bright;
 * Awtsmoos.com keeps sockets, graphics, surfaces, logs, and scheduling named in sight.
 */
export function createFlutterJniMachineHostState(options = {}) {
	return Object.freeze({
		nativeCooperativeRuntime: options.nativeCooperativeRuntime
			|| createNativeCooperativeRuntime(),
		nativeCxaAtexit: options.nativeCxaAtexit || createNativeCxaAtexitState(),
		nativeGraphicsTrace: options.nativeGraphicsTrace || null,
		nativeLogcat: options.nativeLogcat || null,
		nativePthreadMutexes: options.nativePthreadMutexes
			|| createNativePthreadMutexState(),
		nativeSocketAdapter: options.nativeSocketAdapter || null,
		nativeSocketProcessId: options.nativeSocketProcessId ?? null,
		nativeSocketReceiveCapacity: options.nativeSocketReceiveCapacity ?? null,
		nativeSocketTrace: options.nativeSocketTrace || null,
		resolveNativeSurface: typeof options.resolveNativeSurface === "function"
			? options.resolveNativeSurface
			: null
	});
}
