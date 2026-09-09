//B"H
//Boruch Hashem
//Blessed be He

import { deliverNativeAndroidPlatformLooperCallback } from "./nativeAndroidPlatformLooperCallback.js";

const EMPTY = Object.freeze([]);
const MAXIMUM_CALLBACKS_PER_DRAIN = 64;

/**
 * Creates the browser-side servant for Android's root platform-thread ALooper.
 *
 * Android's Java/UI loop normally services callback-bearing native descriptors.
 * The browser has no such host loop, so this pump re-enters genuine guest AArch64
 * callbacks on the persistent JNI TLS identity whenever measured readiness exists.
 * Each descriptor is visited at most once per drain, preventing a level-triggered
 * fd from spinning repeatedly before guest code or a later host tick changes state.
 *
 * @param {object} options Root machine state, native registry, and ALooper state.
 * @returns {object} Frozen bounded pump with drain and immutable diagnostics.
 */
export function createNativeAndroidPlatformLooperPump(options) {
	const state = options.state;
	const thread = nativeAndroidPlatformThread(options.machineState);
	const available = thread !== 0n && typeof state?.pollCallback === "function";
	let draining = false;
	let lastDrain = EMPTY;
	let lastError = null;
	let totalCallbacks = 0;
	let totalFailures = 0;
	return Object.freeze({
		drain() {
			if (!available || draining) {
				return EMPTY;
			}
			draining = true;
			const delivered = [];
			const servedDescriptors = new Set();
			try {
				for (let index = 0; index < MAXIMUM_CALLBACKS_PER_DRAIN; index += 1) {
					const event = state.pollCallback(thread, servedDescriptors);
					if (event.kind !== "event") {
						break;
					}
					servedDescriptors.add(event.fd);
					try {
						const evidence = deliverNativeAndroidPlatformLooperCallback(
							event,
							options,
							thread
						);
						delivered.push(evidence);
					} catch (error) {
						lastError = nativeAndroidPlatformLooperFailure(error, event, thread);
						totalFailures += 1;
						break;
					}
				}
				totalCallbacks += delivered.length;
				lastDrain = Object.freeze(delivered.slice());
				return lastDrain;
			} finally {
				draining = false;
			}
		},
		snapshot() {
			return Object.freeze({
				active: available,
				draining,
				lastDrain,
				lastError,
				thread: thread.toString(),
				totalCallbacks,
				totalFailures
			});
		}
	});
}

/**
 * Resolves the root JNI TLS identity rather than inventing a pthread handle.
 * The explicit thread region is authoritative; TPIDR_EL0 is a compatibility
 * fallback for focused machine fixtures that expose only architectural state.
 */
export function nativeAndroidPlatformThread(machineState) {
	if (machineState?.thread?.pointer !== undefined) {
		return BigInt(machineState.thread.pointer);
	}
	try {
		return machineState?.systemRegisters?.read("TPIDR_EL0") || 0n;
	} catch {
		return 0n;
	}
}

/**
 * Serializes one callback boundary failure without crashing a host timer callback.
 * Guest failure remains visible in diagnostics and stops the current drain so later
 * callbacks are not executed after an uncertain guest machine boundary.
 */
function nativeAndroidPlatformLooperFailure(error, event, thread) {
	return Object.freeze({
		callback: event.callback.toString(),
		code: error?.code || "NATIVE_ANDROID_PLATFORM_LOOPER_CALLBACK",
		fd: event.fd,
		message: String(error?.message || error),
		thread: thread.toString()
	});
}
