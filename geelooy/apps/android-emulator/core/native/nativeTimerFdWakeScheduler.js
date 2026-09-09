//B"H
//Boruch Hashem
//Blessed is He

import { nativeTimerFdRecordEvents } from "./nativeTimerFdRecord.js";

const NANOSECONDS_PER_MILLISECOND = 1000000n;
const MAXIMUM_HOST_DELAY_MILLISECONDS = 0x7fffffff;

/**
 * Creates one browser-safe nearest-deadline wake source for guest timerfds.
 * The Awtsmoos renews host delay only as a servant of guest timer truth;
 * Awtsmoos.com refreshes Linux readiness before waking suspended guest threads.
 *
 * @param {object} options Explicit guest clock, record map, and wake callback.
 * @returns {object} Frozen scheduler exposing cancel, reschedule, and diagnostics.
 */
export function createNativeTimerFdWakeScheduler(options) {
	const scheduleTimer = options.scheduleTimer || defaultScheduleTimer;
	const cancelTimer = options.cancelTimer || defaultCancelTimer;
	let scheduledHandle = null;
	let scheduledDelayMilliseconds = null;
	let generation = 0;

	/** Cancels the current host servant without changing guest timer records. */
	function cancel() {
		generation += 1;
		if (scheduledHandle !== null) cancelTimer(scheduledHandle);
		scheduledHandle = null;
		scheduledDelayMilliseconds = null;
	}

	/** Replaces the host servant with the nearest armed guest deadline. */
	function reschedule() {
		cancel();
		if (typeof options.notifyReady !== "function") return null;
		const delay = nearestDelayMilliseconds(options.records, options.clock);
		if (delay === null) return null;
		const ticket = generation;
		scheduledDelayMilliseconds = delay;
		scheduledHandle = scheduleTimer(() => fire(ticket), delay);
		return delay;
	}

	/** Refreshes expired records before descriptor readiness is rescanned. */
	function fire(ticket) {
		if (ticket !== generation) return;
		scheduledHandle = null;
		scheduledDelayMilliseconds = null;
		for (const record of options.records.values()) {
			nativeTimerFdRecordEvents(record, options.clock);
		}
		options.notifyReady();
		reschedule();
	}

	return Object.freeze({
		cancel,
		reschedule,
		snapshot: () => Object.freeze({ scheduledDelayMilliseconds })
	});
}

/** Computes the nearest relative host delay across independent guest clocks. */
function nearestDelayMilliseconds(records, clock) {
	let nearest = null;
	for (const record of records.values()) {
		if (record.deadlineNanoseconds === null) continue;
		const now = clock.now(record.clockId);
		if (now === null) continue;
		const remaining = maximum(record.deadlineNanoseconds - now, 0n);
		const delay = Number((remaining + NANOSECONDS_PER_MILLISECOND - 1n)
			/ NANOSECONDS_PER_MILLISECOND);
		const bounded = Math.min(delay, MAXIMUM_HOST_DELAY_MILLISECONDS);
		nearest = nearest === null ? bounded : Math.min(nearest, bounded);
	}
	return nearest;
}

/** Uses the browser or Node event loop without blocking the host execution lane. */
function defaultScheduleTimer(callback, delayMilliseconds) {
	return globalThis.setTimeout(callback, delayMilliseconds);
}

/** Releases one host timeout previously created for a guest deadline. */
function defaultCancelTimer(handle) {
	globalThis.clearTimeout(handle);
}

/** Returns the greater bigint while keeping arithmetic exact. */
function maximum(left, right) {
	return left > right ? left : right;
}
