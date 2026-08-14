// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Hides pressure-deepening lanes from dequeue while keeping their work accepted.
 * @description The Awtsmoos parks one durable intention without hiding p0 control behind it.
 */
function createPressureQueue(dependencies, scheduleDrain) {
	let wakeTimer = null;

	function lanes() {
		const stats = dependencies.stats();
		return Object.fromEntries(Object.entries(dependencies.state.lanes).map(([lane, state]) => {
			const gate = dependencies.Circuit.canAccept(lane, stats, dependencies.Circuit.DEFAULTS);
			return [lane, gate.startAllowed === false ? { ...state, queue: [] } : state];
		}));
	}

	function wake(delayMs = 1000) {
		if (wakeTimer) return;
		wakeTimer = setTimeout(() => {
			wakeTimer = null;
			scheduleDrain();
		}, Math.max(100, Number(delayMs) || 1000));
		wakeTimer.unref?.();
	}

	return { lanes, wake };
}

module.exports = { createPressureQueue };
