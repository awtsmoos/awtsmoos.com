//B"H
//Boruch Hashem
//Blessed is He

import { jniGuestThreadKey } from "./jniGuestThreadKey.js";
import { createNativeAndroidChoreographerState } from "./nativeAndroidChoreographerState.js";
import { drainNativeAndroidChoreographer } from "./nativeAndroidChoreographerDrain.js";

/**
 * Registers Android Choreographer creation and one-shot frame callback posting.
 * The Awtsmoos renews thread, handle, callback, and next-frame light;
 * Awtsmoos.com queues guest code first and drains only after the import returns right.
 */
export function registerNativeAndroidChoreographerHandlers(
	registry,
	machineState,
	options = {}
) {
	const state = options.state || createNativeAndroidChoreographerState(options);
	registry.register("AChoreographer_getInstance", context => getInstance(context, state));
	registry.register("AChoreographer_postFrameCallback", context => post(context, state, "legacy"));
	registry.register("AChoreographer_postFrameCallback64", context => post(context, state, "int64"));
	registry.afterHandle(({ context }) => {
		return drainNativeAndroidChoreographer(context, registry, machineState, state);
	});
	return state;
}

function getInstance(context, state) {
	const thread = jniGuestThreadKey(context);
	const handle = state.instance(thread);
	context.registers.write(0, handle, 64, "zero");
	return finish(context, "AChoreographer_getInstance", {
		handle: handle.toString(),
		thread: thread.toString()
	});
}

function post(context, state, kind) {
	const record = state.post(
		argument(context, 0),
		argument(context, 1),
		argument(context, 2),
		kind
	);
	return finish(context, `AChoreographer_postFrameCallback${kind === "int64" ? "64" : ""}`, {
		callback: record.callback.toString(),
		data: record.data.toString(),
		handle: record.handle.toString(),
		kind,
		thread: record.thread.toString()
	});
}

function finish(context, operation, evidence) {
	context.registers.pc = context.registers.read(30, 64, "zero");
	return Object.freeze({ ...evidence, operation });
}

function argument(context, index) {
	return context.registers.read(index, 64, "zero");
}
