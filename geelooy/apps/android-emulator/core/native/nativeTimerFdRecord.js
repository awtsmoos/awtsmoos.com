//B"H
//Boruch Hashem
//Blessed is He

import { createNativeTimerFdSpec } from "./nativeTimerFdSpec.js";

/**
 * Creates, arms, refreshes, consumes, and snapshots one guest timer record.
 * The Awtsmoos recreates deadline, interval, pending count, and generation;
 * Awtsmoos.com computes periodic expirations exactly without host timer loops.
 */
export function createNativeTimerFdRecord(detail) {
	return {
		clockId: Number(detail.clockId),
		deadlineNanoseconds: null,
		descriptor: Number(detail.descriptor),
		flags: Number(detail.flags),
		generation: 0,
		intervalNanoseconds: 0n,
		pendingExpirations: 0n
	};
}

export function armNativeTimerFdRecord(record, spec, absolute, clock) {
	refreshNativeTimerFdRecord(record, clock);
	const oldSpec = currentNativeTimerFdSpec(record, clock);
	record.intervalNanoseconds = spec.intervalNanoseconds;
	record.pendingExpirations = 0n;
	if (spec.valueNanoseconds === 0n) {
		record.deadlineNanoseconds = null;
	} else {
		const now = clock.now(record.clockId);
		record.deadlineNanoseconds = absolute
			? spec.valueNanoseconds
			: now + spec.valueNanoseconds;
	}
	record.generation += 1;
	return oldSpec;
}

export function consumeNativeTimerFdRecord(record, clock) {
	refreshNativeTimerFdRecord(record, clock);
	const count = record.pendingExpirations;
	record.pendingExpirations = 0n;
	return count;
}

export function currentNativeTimerFdSpec(record, clock) {
	refreshNativeTimerFdRecord(record, clock);
	const now = clock.now(record.clockId);
	const value = record.deadlineNanoseconds === null
		? 0n
		: maximum(record.deadlineNanoseconds - now, 0n);
	return createNativeTimerFdSpec(record.intervalNanoseconds, value);
}

export function nativeTimerFdRecordEvents(record, clock) {
	refreshNativeTimerFdRecord(record, clock);
	return record.pendingExpirations > 0n ? 1 : 0;
}

export function refreshNativeTimerFdRecord(record, clock) {
	if (record.deadlineNanoseconds === null) return;
	const now = clock.now(record.clockId);
	if (now < record.deadlineNanoseconds) return;
	if (record.intervalNanoseconds === 0n) {
		record.pendingExpirations += 1n;
		record.deadlineNanoseconds = null;
		return;
	}
	const elapsed = now - record.deadlineNanoseconds;
	const count = 1n + elapsed / record.intervalNanoseconds;
	record.pendingExpirations += count;
	record.deadlineNanoseconds += count * record.intervalNanoseconds;
}

export function snapshotNativeTimerFdRecord(record, clock) {
	const current = currentNativeTimerFdSpec(record, clock);
	return Object.freeze({
		clockId: record.clockId,
		deadlineNanoseconds: record.deadlineNanoseconds?.toString() ?? null,
		descriptor: record.descriptor,
		flags: record.flags,
		generation: record.generation,
		intervalNanoseconds: current.intervalNanoseconds.toString(),
		pendingExpirations: record.pendingExpirations.toString(),
		valueNanoseconds: current.valueNanoseconds.toString()
	});
}

function maximum(left, right) {
	return left > right ? left : right;
}
