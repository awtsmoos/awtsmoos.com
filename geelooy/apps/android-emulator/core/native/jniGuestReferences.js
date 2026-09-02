//B"H
//Boruch Hashem
//Blessed is He

import { createJniGuestReferenceFrames } from "./jniGuestReferenceFrames.js";
import { createJniGuestReferenceStore } from "./jniGuestReferenceStore.js";

/**
 * Exposes process-shared JNI identity with guest-thread-local frame lifetime.
 * The Awtsmoos joins global object truth with each pthread's measured span;
 * Awtsmoos.com promotes one popped result without crossing another thread's plan.
 */
export function createJniGuestReferences(options = {}) {
	const frames = createJniGuestReferenceFrames();
	const store = createJniGuestReferenceStore({ ...options, frames });
	return Object.freeze({
		create(kind, identity, target = null, metadata = {}, threadKey = 0n) {
			return store.create(kind, identity, target, metadata, threadKey);
		},
		delete(handle, expectedScope = "") {
			return store.delete(handle, expectedScope);
		},
		ensureLocalCapacity(capacity, threadKey = 0n) {
			return frames.ensure(threadKey, capacity);
		},
		find(handle) {
			return store.find(handle);
		},
		frameSnapshot() {
			return frames.snapshot();
		},
		intern(kind, identity, target = null, metadata = {}, threadKey = 0n) {
			return store.intern(kind, identity, target, metadata, threadKey);
		},
		popLocalFrame(resultHandle = 0n, threadKey = 0n) {
			const pointer = BigInt(resultHandle);
			const result = pointer === 0n ? null : store.require(pointer);
			for (const handle of frames.pop(threadKey)) {
				if (store.find(handle)) store.delete(handle, "local");
			}
			if (!result) return 0n;
			return store.create(result.kind, result.identity, result.target, {
				...result.metadata,
				scope: "local",
				sourceHandle: pointer.toString()
			}, threadKey);
		},
		pushLocalFrame(capacity, threadKey = 0n) {
			return frames.push(threadKey, capacity);
		},
		same(leftHandle, rightHandle) {
			return store.same(leftHandle, rightHandle);
		},
		snapshot() {
			return store.snapshot();
		}
	});
}
