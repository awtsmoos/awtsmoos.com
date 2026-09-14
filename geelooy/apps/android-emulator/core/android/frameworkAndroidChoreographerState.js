//B"H
//Boruch Hashem
//Blessed be He

import { invokeGuestTaskMethod } from "./frameworkJavaTaskResolution.js";

const CHOREOGRAPHER = "Landroid/view/Choreographer;";
const FRAME_CALLBACK = "(J)V";
const FRAME_INTERVAL_NANOS = 16666667n;
const MAXIMUM_PENDING_CALLBACKS = 4096;

/**
 * Returns the process-local Java Choreographer singleton object.
 * The object is guest-visible while callback contexts remain private runtime state.
 *
 * @param {object} runtime Live Android runtime.
 * @returns {object} Guest Choreographer reference.
 */
export function javaChoreographerInstance(runtime) {
	const state = stateFor(runtime);
	if (!state.instance) state.instance = runtime.heap.allocate(CHOREOGRAPHER);
	return state.instance;
}

/**
 * Queues one genuine guest FrameCallback and schedules a later display turn.
 * Delivery never occurs while Flutter's persistent native root lease is occupied.
 *
 * @param {object} runtime Live Android runtime.
 * @param {object} context Dalvik context capable of invoking the guest callback.
 * @param {object} callback Guest FrameCallback reference.
 * @param {number|bigint} delay Requested Android delay in milliseconds.
 */
export function postJavaChoreographerFrame(runtime, context, callback, delay = 0) {
	if (!callback?.id) throw stateError("ANDROID_CHOREOGRAPHER_CALLBACK_REQUIRED", callback);
	const state = stateFor(runtime);
	if (state.pending.length >= MAXIMUM_PENDING_CALLBACKS) {
		throw stateError("ANDROID_CHOREOGRAPHER_QUEUE_LIMIT", state.pending.length);
	}
	state.pending.push(Object.freeze({ callback, context }));
	schedule(runtime, state, Math.max(0, Number(delay || 0)));
}

/** Removes every pending one-shot callback with the same guest identity. */
export function removeJavaChoreographerFrame(runtime, callback) {
	const state = stateFor(runtime);
	state.pending = state.pending.filter(entry => entry.callback?.id !== callback?.id);
}

/** Returns immutable frame-queue testimony without exposing Dalvik contexts. */
export function snapshotJavaChoreographer(runtime) {
	const state = stateFor(runtime);
	return Object.freeze({
		failure: state.failure ? String(state.failure.message || state.failure) : null,
		frameTimeNanos: state.frameTimeNanos.toString(),
		pending: state.pending.length,
		scheduled: state.scheduled
	});
}

function schedule(runtime, state, delay = 0) {
	if (state.scheduled || !state.pending.length) return;
	state.scheduled = true;
	globalThis.setTimeout(() => {
		void deliver(runtime, state);
	}, Math.max(1, delay || 16));
}

async function deliver(runtime, state) {
	state.scheduled = false;
	if (await rootExecutionActive(runtime)) {
		schedule(runtime, state);
		return;
	}
	state.frameTimeNanos += FRAME_INTERVAL_NANOS;
	const callbacks = state.pending.splice(0);
	try {
		for (const entry of callbacks) {
			await invokeGuestTaskMethod(
				runtime,
				entry.context,
				entry.callback,
				"doFrame",
				FRAME_CALLBACK,
				[state.frameTimeNanos]
			);
		}
	} catch (error) {
		state.failure = error;
	}
	if (state.pending.length) schedule(runtime, state);
}

async function rootExecutionActive(runtime) {
	if (!runtime.flutterNativeSessionPromise) return false;
	const session = await runtime.flutterNativeSessionPromise;
	return Boolean(session?.state?.nativeRootExecution?.active?.());
}

function stateFor(runtime) {
	if (runtime.javaChoreographerState) return runtime.javaChoreographerState;
	runtime.javaChoreographerState = {
		failure: null,
		frameTimeNanos: 0n,
		instance: null,
		pending: [],
		scheduled: false
	};
	return runtime.javaChoreographerState;
}

function stateError(code, detail) {
	const error = new Error(`${code}:${detail ?? ""}`);
	error.code = code;
	return error;
}
