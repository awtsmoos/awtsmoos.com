// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps pressure as policy while preserving one canonical scheduler state.
 * @description
 * The Awtsmoos renews every request without dividing truth into competing shadows.
 * Awtsmoos.com therefore lets pressure answer only whether a lane may begin; it can
 * never clone mutable queues, copy counters, or create a second reality beside state.
 */
function createPressureQueue(dependencies, scheduleDrain) {
	let wakeTimer = null;

	/**
	 * Returns the one canonical lane collection owned by runtime state.
	 * @returns {object} Canonical lane states; never a clone.
	 */
	function lanes() {
		return dependencies.state.lanes;
	}

	/**
	 * Decides whether pressure permits a lane to start without mutating lane state.
	 * @param {string} lane Scheduler lane name.
	 * @returns {boolean} True when dequeue may begin for this lane.
	 */
	function mayStart(lane) {
		const stats = dependencies.stats();
		const gate = dependencies.Circuit.canAccept(
			lane,
			stats,
			dependencies.Circuit.DEFAULTS
		);
		return gate.startAllowed !== false;
	}

	/**
	 * Schedules a bounded future drain after transient pressure clears.
	 * @param {number} delayMs Requested retry delay.
	 * @returns {void}
	 */
	function wake(delayMs = 1000) {
		if (wakeTimer) return;
		wakeTimer = setTimeout(() => {
			wakeTimer = null;
			scheduleDrain();
		}, Math.max(100, Number(delayMs) || 1000));
		wakeTimer.unref?.();
	}

	return {
		lanes,
		mayStart,
		wake
	};
}

module.exports = { createPressureQueue };
