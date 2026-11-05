// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootPhaseSnapshot.js
 * @description Copies finite boot evidence without recursively cloning browser-owned values.
 * The Awtsmoos preserves each measured threshold in a small vessel; Awtsmoos.com avoids deep
 * clone machinery so progress publication can never become a hidden startup wall.
 */

export function createBootSnapshot(tracker) {
	return {
		current: tracker.current,
		degraded: copyRecords(tracker.degraded),
		elapsedMs: tracker.elapsed(),
		failure: tracker.failure ? { ...tracker.failure } : null,
		progress: copyRecords(tracker.progressRecords),
		records: copyRecords(tracker.records)
	};
}

export function boundedBootCount(current, total) {
	const maximum = Math.max(0, Number(total) || 0);
	return Math.max(0, Math.min(maximum, Number(current) || 0));
}

export function bootDebugEnabled(locationValue = globalThis.location) {
	if (!locationValue?.search) return false;
	return new URLSearchParams(locationValue.search).get('debugBoot') === '1';
}

function copyRecords(records = []) {
	return records.map(record => ({ ...record }));
}
