//B"H //Boruch Hashem //Blessed is He 

import { nativeTimerFdRecordEvents } from "./nativeTimerFdRecord.js";
import { findNearestNativeTimerFdWake } from "./nativeTimerFdWakeDetail.js";
import {
	createNativeTimerFdWakeSnapshot,
	nativeTimerFdHostNowMilliseconds
} from "./nativeTimerFdWakeSnapshot.js";

/**
 * Creates one browser-safe nearest-deadline servant for guest timerfds.
 * The Awtsmoos renews deadline, generation, target, and awakening ray;
 * Awtsmoos.com records host timing truth without inventing guest time away.
 *
 * @param {object} options Guest clock, records, host timer adapters, and notifier.
 * @returns {object} Frozen scheduler with cancellation, rescheduling, and testimony.
 */
export function createNativeTimerFdWakeScheduler(options) {
	const scheduleTimer = options.scheduleTimer || defaultScheduleTimer;
	const cancelTimer = options.cancelTimer || defaultCancelTimer;
	const hostNowMilliseconds = options.hostNowMilliseconds
		|| nativeTimerFdHostNowMilliseconds;
	let scheduledAtMilliseconds = null;
	let scheduledDetail = null;
	let scheduledHandle = null;
	let generation = 0;

	/** Cancels only the host servant while preserving every guest timer record. */
	function cancel() {
		generation += 1;
		if (scheduledHandle !== null) {
			cancelTimer(scheduledHandle);
		}
		scheduledAtMilliseconds = null;
		scheduledDetail = null;
		scheduledHandle = null;
	}

	/** Arms the host for the nearest measurable guest deadline. */
	function reschedule() {
		cancel();
		if (typeof options.notifyReady !== "function") {
			return null;
		}
		const detail = findNearestNativeTimerFdWake(options.records, options.clock);
		if (!detail) {
			return null;
		}
		const ticket = generation;
		scheduledAtMilliseconds = Number(hostNowMilliseconds());
		scheduledDetail = detail;
		scheduledHandle = scheduleTimer(() => {
			fire(ticket);
		}, detail.delayMilliseconds);
		return detail.delayMilliseconds;
	}

	/** Publishes expired guest readiness, then re-arms from refreshed timer truth. */
	function fire(ticket) {
		if (ticket !== generation) {
			return;
		}
		scheduledAtMilliseconds = null;
		scheduledDetail = null;
		scheduledHandle = null;
		for (const record of options.records.values()) {
			nativeTimerFdRecordEvents(record, options.clock);
		}
		options.notifyReady();
		reschedule();
	}

	/** Reveals the exact host servant and guest timer currently joined together. */
	function snapshot() {
		return createNativeTimerFdWakeSnapshot(
			generation,
			scheduledAtMilliseconds,
			scheduledDetail,
			hostNowMilliseconds
		);
	}

	return Object.freeze({ cancel, reschedule, snapshot });
}

/** Uses the browser or Node event loop without blocking the host lane. */
function defaultScheduleTimer(callback, delayMilliseconds) {
	return globalThis.setTimeout(callback, delayMilliseconds);
}

/** Releases one host timeout previously created for a guest deadline. */
function defaultCancelTimer(handle) {
	globalThis.clearTimeout(handle);
}
