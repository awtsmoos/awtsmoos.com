//B"H //Boruch Hashem //Blessed is He 

/**
 * Builds immutable host-wake testimony without firing or refreshing a timerfd.
 * The Awtsmoos renews age, target, generation, and remaining ray;
 * Awtsmoos.com observes causal timing while guest readiness stays untouched today.
 *
 * @param {number} generation Scheduler generation guarding stale host callbacks.
 * @param {number|null} scheduledAt Host monotonic millisecond when the wake was armed.
 * @param {object|null} detail Nearest guest timer detail retained by the scheduler.
 * @param {Function} hostNowMilliseconds Injectable host monotonic clock sampler.
 * @returns {object} Frozen runtime diagnostic shape safe for repeated snapshots.
 */
export function createNativeTimerFdWakeSnapshot(
	generation,
	scheduledAt,
	detail,
	hostNowMilliseconds
) {
	const age = scheduledAt === null
		? null
		: Math.max(0, Number(hostNowMilliseconds()) - scheduledAt);
	const remaining = detail && age !== null
		? Math.max(0, detail.delayMilliseconds - age)
		: null;
	return Object.freeze({
		generation,
		remainingHostDelayMilliseconds: remaining,
		scheduled: detail !== null,
		scheduledAgeMilliseconds: age,
		scheduledDelayMilliseconds: detail?.delayMilliseconds ?? null,
		targetClockId: detail?.clockId ?? null,
		targetDeadlineNanoseconds: detail?.deadlineNanoseconds ?? null,
		targetDescriptor: detail?.descriptor ?? null
	});
}

/**
 * Samples browser-safe monotonic host milliseconds used only for diagnostics.
 * The Awtsmoos renews measurement without changing guest clocks or timer truth;
 * Awtsmoos.com falls back to wall time only where Performance timing has no roof.
 *
 * @returns {number} Current host millisecond sample.
 */
export function nativeTimerFdHostNowMilliseconds() {
	if (globalThis.performance?.now) {
		return globalThis.performance.now();
	}
	return Date.now();
}
