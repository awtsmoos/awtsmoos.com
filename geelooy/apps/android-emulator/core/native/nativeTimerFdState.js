//B"H
//Boruch Hashem
//Blessed is He

import {
	armNativeTimerFdRecord,
	consumeNativeTimerFdRecord,
	createNativeTimerFdRecord,
	nativeTimerFdRecordEvents,
	snapshotNativeTimerFdRecord
} from "./nativeTimerFdRecord.js";
import { createNativeTimerFdWakeScheduler } from "./nativeTimerFdWakeScheduler.js";

export const TFD_NONBLOCK = 0x800;
export const TFD_CLOEXEC = 0x80000;
export const TFD_TIMER_ABSTIME = 1;
const ALLOWED_CREATE_FLAGS = TFD_NONBLOCK | TFD_CLOEXEC;
const DEFAULT_DESCRIPTOR_BASE = 0x40000000;
const DEFAULT_CAPACITY = 1024;

/**
 * Creates bounded Linux timer descriptors over one explicit guest clock.
 * The Awtsmoos renews allocation, arming, readiness, count, host wake, and close;
 * Awtsmoos.com lets real time awaken suspended guest threads without polling loops.
 */
export function createNativeTimerFdState(options) {
	const clock = options.clock;
	const base = Number(options.descriptorBase ?? DEFAULT_DESCRIPTOR_BASE);
	const capacity = Number(options.capacity ?? DEFAULT_CAPACITY);
	const records = new Map();
	const wakeScheduler = createNativeTimerFdWakeScheduler({ ...options, clock, records });
	return Object.freeze({
		close(descriptorValue) {
			const removed = records.delete(Number(descriptorValue));
			if (removed) wakeScheduler.reschedule();
			return removed;
		},
		create(clockIdValue, flagsValue) {
			const clockId = Number(clockIdValue);
			const flags = Number(flagsValue) >>> 0;
			if (!clock.supports(clockId) || (flags & ~ALLOWED_CREATE_FLAGS) !== 0) {
				return Object.freeze({ error: "invalid", ok: false });
			}
			const descriptor = allocateDescriptor(records, base, capacity);
			if (descriptor === null) return Object.freeze({ error: "capacity", ok: false });
			records.set(descriptor, createNativeTimerFdRecord({ clockId, descriptor, flags }));
			return Object.freeze({ descriptor, ok: true });
		},
		events(descriptorValue) {
			const record = records.get(Number(descriptorValue));
			return record ? nativeTimerFdRecordEvents(record, clock) : 0;
		},
		has: descriptorValue => records.has(Number(descriptorValue)),
		read(descriptorValue) {
			const record = records.get(Number(descriptorValue));
			if (!record) return Object.freeze({ error: "bad-fd", ok: false });
			const count = consumeNativeTimerFdRecord(record, clock);
			wakeScheduler.reschedule();
			return Object.freeze({ count, ok: true, ready: count > 0n });
		},
		settime(descriptorValue, flagsValue, spec) {
			const record = records.get(Number(descriptorValue));
			if (!record) return Object.freeze({ error: "bad-fd", ok: false });
			const flags = Number(flagsValue) >>> 0;
			if ((flags & ~TFD_TIMER_ABSTIME) !== 0) return Object.freeze({ error: "invalid", ok: false });
			const oldSpec = armNativeTimerFdRecord(
				record,
				spec,
				(flags & TFD_TIMER_ABSTIME) !== 0,
				clock
			);
			wakeScheduler.reschedule();
			return Object.freeze({ ok: true, oldSpec });
		},
		snapshot() {
			return Object.freeze([...records.values()]
				.sort((left, right) => left.descriptor - right.descriptor)
				.map(record => snapshotNativeTimerFdRecord(record, clock)));
		},
		wakeSnapshot: wakeScheduler.snapshot
	});
}

/** Allocates the first free bounded virtual descriptor. */
function allocateDescriptor(records, base, capacity) {
	for (let offset = 0; offset < capacity; offset += 1) {
		const descriptor = base + offset;
		if (!records.has(descriptor)) return descriptor;
	}
	return null;
}
