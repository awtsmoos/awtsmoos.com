//B"H
//Boruch Hashem
//Blessed be He

import {
	nativeAndroidPlatformThread,
	nativeAndroidPlatformThreadBusy
} from "./nativeAndroidPlatformLooperAccess.js";
import { deliverNativeAndroidPlatformLooperCallback } from "./nativeAndroidPlatformLooperCallback.js";
import { createNativeAndroidPlatformLooperFailure } from "./nativeAndroidPlatformLooperFailure.js";

const EMPTY = Object.freeze([]);
const MAXIMUM_CALLBACKS_PER_DRAIN = 64;

/**
 * Creates the bounded servant for Android's root platform-thread ALooper.
 * Synchronous callbacks preserve the ordinary fast path while callbacks that cross
 * JNI into guest Java keep the drain lease until their authentic promise settles.
 *
 * @param {object} options Root machine state, native registry, and ALooper state.
 * @returns {object} Frozen drain API and immutable diagnostics.
 */
export function createNativeAndroidPlatformLooperPump(options) {
	const state = options.state;
	const thread = nativeAndroidPlatformThread(options.machineState);
	const available = thread !== 0n && typeof state?.pollCallback === "function";
	let deferredDrains = 0;
	let draining = false;
	let lastDrain = EMPTY;
	let lastError = null;
	let totalCallbacks = 0;
	let totalFailures = 0;

	/** Services ready callbacks without overlapping one already awaiting Java. */
	function drain() {
		if (!available || draining) return EMPTY;
		if (nativeAndroidPlatformThreadBusy(options.machineState)) {
			deferredDrains += 1;
			return EMPTY;
		}
		draining = true;
		const delivered = [];
		const servedDescriptors = new Set();
		for (let index = 0; index < MAXIMUM_CALLBACKS_PER_DRAIN; index += 1) {
			const event = state.pollCallback(thread, servedDescriptors);
			if (event.kind !== "event") break;
			servedDescriptors.add(event.fd);
			let result;
			try {
				result = deliverNativeAndroidPlatformLooperCallback(event, options, thread);
			} catch (error) {
				finishFailure(error, event, delivered);
				return lastDrain;
			}
			if (result && typeof result.then === "function") {
				void settleAsync(result, event, delivered);
				return EMPTY;
			}
			delivered.push(result);
		}
		finishSuccess(delivered);
		return lastDrain;
	}

	/** Completes one callback that temporarily crossed from native code into Java. */
	async function settleAsync(promise, event, delivered) {
		try {
			delivered.push(await promise);
			finishSuccess(delivered);
		} catch (error) {
			finishFailure(error, event, delivered);
		} finally {
			queueDescriptorRecheck(options.machineState);
		}
	}

	/** Publishes successful callback testimony and releases the drain lease. */
	function finishSuccess(delivered) {
		totalCallbacks += delivered.length;
		lastDrain = Object.freeze(delivered.slice());
		draining = false;
	}

	/** Publishes a contained callback failure while preserving earlier successes. */
	function finishFailure(error, event, delivered) {
		totalCallbacks += delivered.length;
		lastDrain = Object.freeze(delivered.slice());
		lastError = createNativeAndroidPlatformLooperFailure(error, event, thread);
		totalFailures += 1;
		draining = false;
	}

	/** Reveals callback activity without consuming descriptor readiness. */
	function snapshot() {
		return Object.freeze({
			active: available,
			deferredDrains,
			draining,
			lastDrain,
			lastError,
			rootExecution: options.machineState?.nativeRootExecution?.snapshot?.() || null,
			thread: thread.toString(),
			totalCallbacks,
			totalFailures
		});
	}

	return Object.freeze({ drain, snapshot });
}

/** Rechecks descriptor truth only after an asynchronous callback fully settles. */
function queueDescriptorRecheck(machineState) {
	globalThis.queueMicrotask(() => {
		machineState?.nativeCooperativeRuntime?.notifyDescriptors?.();
	});
}
