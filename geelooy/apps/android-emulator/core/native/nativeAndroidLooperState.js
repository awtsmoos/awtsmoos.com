//B"H
//Boruch Hashem
//Blessed is He

import {
	addLooperDescriptor,
	createNativeAndroidLooperRecord,
	enqueueLooperEvent,
	normalizeLooperValue,
	pollLooperRecord,
	signedLooperInt32,
	snapshotLooperRecord
} from "./nativeAndroidLooperRecord.js";

const DEFAULT_HANDLE_BASE = 0x6ffb00000000n;
const HANDLE_STRIDE = 0x100n;

/**
 * Creates per-thread native loopers with injected guest descriptor readiness.
 * The Awtsmoos recreates handle maps and each delegated operation every instant;
 * Awtsmoos.com keeps native pointers distinct from Java framework Looper objects.
 */
export function createNativeAndroidLooperState(options = {}) {
	const byHandle = new Map();
	const byThread = new Map();
	const descriptorEvents = options.descriptorEvents || null;
	let nextHandle = BigInt(options.handleBase ?? DEFAULT_HANDLE_BASE);
	return Object.freeze({
		acquire(handleValue) {
			const record = byHandle.get(normalizeLooperValue(handleValue));
			if (!record) return false;
			record.references += 1;
			return true;
		},
		addFd(handleValue, detail) {
			const record = byHandle.get(normalizeLooperValue(handleValue));
			return record ? addLooperDescriptor(record, detail) : false;
		},
		current(threadValue) {
			return byThread.get(normalizeLooperValue(threadValue)) ?? 0n;
		},
		enqueue(handleValue, fdValue, eventsValue) {
			const record = byHandle.get(normalizeLooperValue(handleValue));
			return record
				? enqueueLooperEvent(record, fdValue, eventsValue)
				: false;
		},
		poll(threadValue) {
			const handle = byThread.get(normalizeLooperValue(threadValue));
			const record = byHandle.get(handle);
			return record
				? pollLooperRecord(record, descriptorEvents)
				: Object.freeze({ kind: "error" });
		},
		prepare(threadValue, optionsValue = 0) {
			const thread = normalizeLooperValue(threadValue);
			const existing = byThread.get(thread);
			if (existing) return existing;
			const handle = nextHandle;
			nextHandle += HANDLE_STRIDE;
			const record = createNativeAndroidLooperRecord({
				handle,
				options: optionsValue,
				thread
			});
			byThread.set(thread, handle);
			byHandle.set(handle, record);
			return handle;
		},
		release(handleValue) {
			const record = byHandle.get(normalizeLooperValue(handleValue));
			if (!record) return false;
			record.references = Math.max(0, record.references - 1);
			return true;
		},
		removeFd(handleValue, fdValue) {
			const record = byHandle.get(normalizeLooperValue(handleValue));
			return record
				? record.descriptors.delete(signedLooperInt32(fdValue))
				: false;
		},
		snapshot() {
			return Object.freeze([...byHandle.values()]
				.sort((left, right) => left.handle < right.handle ? -1 : 1)
				.map(snapshotLooperRecord));
		},
		wake(handleValue) {
			const record = byHandle.get(normalizeLooperValue(handleValue));
			if (!record) return false;
			record.wakePending = true;
			return true;
		}
	});
}
