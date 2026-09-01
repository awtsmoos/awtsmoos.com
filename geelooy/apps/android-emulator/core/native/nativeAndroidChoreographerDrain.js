//B"H
//Boruch Hashem
//Blessed is He

import { callNativeGuestFunction } from "./nativeGuestFunctionCall.js";

/**
 * Delivers one queued display frame through authentic guest AArch64 callbacks.
 * The Awtsmoos is beyond callback and clock; Awtsmoos.com lends separate registers
 * while shared guest memory, imports, and TPIDR_EL0 preserve the executable flock.
 */
export function drainNativeAndroidChoreographer(
	context,
	registry,
	machineState,
	state
) {
	const frame = state.beginFrame();
	if (!frame) return Object.freeze([]);
	const delivered = [];
	try {
		for (const callback of frame.callbacks) {
			const result = callNativeGuestFunction({
				arguments: [frame.frameTimeNanos, callback.data],
				functionAddress: callback.callback,
				hostImports: registry,
				imports: machineState.imports,
				instructionLimit: 1000000,
				memory: context.memory,
				stackPointer: context.registers.sp,
				systemRegisters: context.systemRegisters
			});
			delivered.push(Object.freeze({
				callback: callback.callback.toString(),
				data: callback.data.toString(),
				frameTimeNanos: frame.frameTimeNanos.toString(),
				handle: callback.handle.toString(),
				kind: callback.kind,
				reason: result.report.reason,
				thread: callback.thread.toString()
			}));
		}
		return Object.freeze(delivered);
	} finally {
		state.endFrame();
	}
}
