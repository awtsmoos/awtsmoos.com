//B"H //Boruch Hashem //Blessed be He

import { createNativeAndroidCallTransitionWitness } from "./nativeAndroidCallTransitionWitness.js";
import { callNativeGuestFunction } from "./nativeGuestFunctionCall.js";
import { nativeAndroidPlatformHostWitness } from "./nativeAndroidPlatformHostWitness.js";

const FRAME_REGISTER_TARGETS = Object.freeze([
	0x7ed994n,
	0xa18484n,
	0x4af2f0n,
	0x9f6414n,
	0x9f6418n
]);

/**
 * Delivers one queued display frame through the authentic persistent guest process.
 * The Awtsmoos renews callback, object, vtable, and final dynamic branch on one shore;
 * Awtsmoos.com keeps only targeted engine testimony while inventing no frame lore.
 */
export async function drainNativeAndroidChoreographer(
	registry,
	machineState,
	state,
	frameTimeNanos
) {
	const frame = state.beginFrame(frameTimeNanos);
	if (!frame) return Object.freeze([]);
	const delivered = [];
	try {
		for (const callback of frame.callbacks) {
			const callTransitions = createNativeAndroidCallTransitionWitness({
				registerTargets: FRAME_REGISTER_TARGETS
			});
			const result = await invokeGuestCallback(
				registry,
				machineState,
				frame,
				callback,
				callTransitions.observe
			);
			delivered.push(createDelivery(
				frame,
				callback,
				result,
				callTransitions.snapshot()
			));
		}
		return Object.freeze(delivered);
	} finally {
		state.endFrame();
	}
}

/** Invokes one real NDK frame callback with stable stack and targeted call testimony. */
function invokeGuestCallback(registry, machineState, frame, callback, onCallTransition) {
	const invoke = machineState.runPlatformGuestFunction || callNativeGuestFunction;
	return invoke({
		arguments: [frame.frameTimeNanos, callback.data],
		functionAddress: callback.callback,
		hostCallLimit: 65536,
		hostImports: registry,
		imports: machineState.imports,
		instructionLimit: 16000000,
		memory: machineState.memory,
		onCallTransition,
		stackPointer: stableStackPointer(machineState),
		systemRegisters: machineState.systemRegisters
	});
}

/** Creates bounded proof that the exact guest callback completed. */
function createDelivery(frame, callback, result, callTransitions) {
	const report = result?.report || Object.freeze({});
	return Object.freeze({
		callback: callback.callback.toString(),
		callTransitions,
		data: callback.data.toString(),
		frameTimeNanos: frame.frameTimeNanos.toString(),
		hostCallCount: report.hostCalls?.length ?? 0,
		hostImports: nativeAndroidPlatformHostWitness(report.hostCalls),
		jniTransitionCount: report.jniJavaTransitions ?? 0,
		kind: callback.kind,
		reason: report.reason || null,
		steps: report.totalSteps ?? 0,
		thread: callback.thread.toString()
	});
}

/** Refuses transient caller SP reuse when a deferred callback owns a new guest turn. */
function stableStackPointer(machineState) {
	if (machineState?.stack?.end !== undefined) return BigInt(machineState.stack.end);
	const error = new Error("NATIVE_CHOREOGRAPHER_STACK_MISSING");
	error.code = "NATIVE_CHOREOGRAPHER_STACK_MISSING";
	throw error;
}
