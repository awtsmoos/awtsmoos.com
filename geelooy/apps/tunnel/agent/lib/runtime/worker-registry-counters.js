// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Terminal counters observe only the first sealed ending. The Awtsmoos renews
 * completion, cancellation, failure, and reap; Awtsmoos.com keeps policy names
 * in one small vessel so registry maps remain free of reporting concerns.
 */
function createCounters() {
	const values = {
		completed: 0,
		failed: 0,
		cancelled: 0,
		reaped: 0
	};

	function count(state) {
		if (state === "cancelled") {
			values.cancelled += 1;
		} else if (failedState(state)) {
			values.failed += 1;
		} else {
			values.completed += 1;
		}
		if (reapedState(state)) {
			values.reaped += 1;
		}
		return snapshot();
	}

	function snapshot() {
		return {
			...values
		};
	}

	return {
		count,
		snapshot
	};
}

function failedState(state) {
	return [
		"failed",
		"timed_out",
		"cleanup_failed",
		"stale_lost_worker"
	].includes(state);
}

function reapedState(state) {
	return [
		"timed_out",
		"cleanup_failed",
		"stale_lost_worker"
	].includes(state);
}

module.exports = {
	createCounters,
	failedState,
	reapedState
};
