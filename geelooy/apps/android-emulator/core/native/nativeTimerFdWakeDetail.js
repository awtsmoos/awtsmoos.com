//B"H //Boruch Hashem //Blessed is He 

const NANOSECONDS_PER_MILLISECOND = 1000000n;
const MAXIMUM_HOST_DELAY_MILLISECONDS = 0x7fffffff;

/**
 * Finds the armed guest timer whose deadline should awaken the host first.
 * The Awtsmoos renews every timer measure and each bounded delay;
 * Awtsmoos.com names the exact descriptor without consuming readiness away.
 *
 * @param {Map<number, object>} records Live timerfd records owned by one process.
 * @param {object} clock Guest Linux clock capable of sampling each record clock ID.
 * @returns {object|null} Immutable nearest wake detail, or null when none is armed.
 */
export function findNearestNativeTimerFdWake(records, clock) {
	let nearest = null;
	for (const record of records.values()) {
		const candidate = createCandidate(record, clock);
		if (!candidate) {
			continue;
		}
		if (nearest && nearest.delayMilliseconds <= candidate.delayMilliseconds) {
			continue;
		}
		nearest = candidate;
	}
	return nearest;
}

/** Converts one armed record into browser-safe host scheduling testimony. */
function createCandidate(record, clock) {
	if (record.deadlineNanoseconds === null) {
		return null;
	}
	const now = clock.now(record.clockId);
	if (now === null) {
		return null;
	}
	const remaining = maximum(record.deadlineNanoseconds - now, 0n);
	const rounded = Number((remaining + NANOSECONDS_PER_MILLISECOND - 1n)
		/ NANOSECONDS_PER_MILLISECOND);
	const delayMilliseconds = Math.min(rounded, MAXIMUM_HOST_DELAY_MILLISECONDS);
	return Object.freeze({
		clockId: record.clockId,
		deadlineNanoseconds: record.deadlineNanoseconds.toString(),
		delayMilliseconds,
		descriptor: record.descriptor
	});
}

/** Returns the greater bigint while preserving exact nanosecond arithmetic. */
function maximum(left, right) {
	return left > right ? left : right;
}
