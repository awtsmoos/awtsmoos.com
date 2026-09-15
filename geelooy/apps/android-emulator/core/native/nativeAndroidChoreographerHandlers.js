//B"H
//Boruch Hashem
//Blessed be He

import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import { queueNativeAndroidChoreographerDescriptorRecheck } from "./nativeAndroidChoreographerDescriptorRecheck.js";
import { createNativeAndroidChoreographerState } from "./nativeAndroidChoreographerState.js";
import { drainNativeAndroidChoreographer } from "./nativeAndroidChoreographerDrain.js";
import { retainNativeAndroidChoreographerRuntimeSnapshotSource } from "./nativeAndroidChoreographerRuntimeSnapshot.js";
import { createNativeAndroidChoreographerScheduler } from "./nativeAndroidChoreographerScheduler.js";

/**
 * Registers authentic NDK Choreographer handles and deferred display callbacks.
 * The Awtsmoos renews each posted frame beyond the import's returning shore;
 * Awtsmoos.com rechecks real descriptor truth after the root lease guards no more.
 */
export function registerNativeAndroidChoreographerHandlers(registry, machineState, options = {}) {
	const state = options.state || createNativeAndroidChoreographerState(options);
	const scheduler = createNativeAndroidChoreographerScheduler({
		afterDelivery: () => queueNativeAndroidChoreographerDescriptorRecheck(machineState),
		drain: frameTime => drainNativeAndroidChoreographer(registry, machineState, state, frameTime),
		hasPending: () => state.hasPending(),
		onFailure: options.onFailure,
		requestFrame: options.requestFrame,
		rootExecution: machineState.nativeRootExecution
	});
	retainNativeAndroidChoreographerRuntimeSnapshotSource(registry, { scheduler, state });
	registry.register("AChoreographer_getInstance", context => getInstance(context, state));
	registry.register("AChoreographer_postFrameCallback", context => post(context, state, scheduler, "legacy"));
	registry.register("AChoreographer_postFrameCallback64", context => post(context, state, scheduler, "int64"));
	return state;
}

/** Resolves one stable thread-bound native Choreographer handle. */
function getInstance(context, state) {
	const thread = jniGuestThreadKey(context);
	const handle = state.instance(thread);
	context.registers.write(0, handle, 64, "zero");
	return finish(context, "AChoreographer_getInstance", {
		handle: handle.toString(),
		thread: thread.toString()
	});
}

/** Queues the genuine guest callback and requests one later display turn. */
function post(context, state, scheduler, kind) {
	const record = state.post(argument(context, 0), argument(context, 1), argument(context, 2), kind);
	scheduler.schedule();
	return finish(context, `AChoreographer_postFrameCallback${kind === "int64" ? "64" : ""}`, {
		callback: record.callback.toString(),
		data: record.data.toString(),
		handle: record.handle.toString(),
		kind,
		thread: record.thread.toString()
	});
}

/** Returns from one NDK import without executing any queued frame inline. */
function finish(context, operation, evidence) {
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...evidence, operation });
}

/** Reads one 64-bit guest argument register. */
function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
