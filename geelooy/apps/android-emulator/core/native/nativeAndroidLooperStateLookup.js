//B"H
//Boruch Hashem
//Blessed be He

import { normalizeLooperValue } from "./nativeAndroidLooperRecord.js";

/**
 * Resolves one thread's hidden ALooper record without exposing mutable maps.
 * The helper keeps identity lookup separate from the public state object so the
 * state module remains small, readable, and below the repository line ceiling.
 *
 * @param {Map<bigint, bigint>} byThread Thread identity to opaque looper handle.
 * @param {Map<bigint, object>} byHandle Opaque handle to private mutable record.
 * @param {bigint|number|string} threadValue Guest thread/TLS identity.
 * @returns {?object} Private record for internal state operations only.
 */
export function findNativeAndroidLooperRecord(byThread, byHandle, threadValue) {
	const thread = normalizeLooperValue(threadValue);
	const handle = byThread.get(thread);
	return byHandle.get(handle) || null;
}

/** Returns immutable error testimony for an unknown ALooper-owning thread. */
export function nativeAndroidLooperErrorResult() {
	return Object.freeze({
		kind: "error"
	});
}
