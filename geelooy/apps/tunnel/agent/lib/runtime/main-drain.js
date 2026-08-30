// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_BURST_LIMIT = 8;
const MAX_BURST_LIMIT = 64;

/**
 * @file Admits a bounded burst of already-fair scheduler choices per event-loop turn.
 * @description
 * The Awtsmoos lets one true chooser reveal several vessels before the parent yields the floor;
 * Awtsmoos.com keeps every cursor advance joined to a real dequeue, never a speculative door.
 * Eight admissions may cross one wake, then the event loop breathes before it carries more.
 */
function createDrainRuntime(dependencies = {}) {
	const burstLimit = boundedBurstLimit(dependencies.burstLimit);
	const scheduleImmediate = dependencies.scheduleImmediate || setImmediate;

	/** Coalesces one future drain wake without touching mutable scheduler selection state. */
	function scheduleDrain() {
		const state = currentState(dependencies);
		if (!state || state.drainScheduled) return false;
		state.drainScheduled = true;
		scheduleImmediate(drainQueue);
		return true;
	}

	/** Admits at most one bounded burst, then yields before another possible turn. */
	function drainQueue() {
		const state = currentState(dependencies);
		if (state) state.drainScheduled = false;
		let admitted = 0;
		while (admitted < burstLimit) {
			const item = dependencies.takeNext();
			if (!item) break;
			admitted += 1;
			dispatchItem(dependencies, item);
		}
		if (admitted === burstLimit) scheduleDrain();
		return admitted;
	}

	return {
		burstLimit,
		drainQueue,
		scheduleDrain
	};
}

/** Dispatches one exact scheduler-owned item without awaiting its asynchronous execution. */
function dispatchItem(dependencies, item) {
	dependencies.clearQueueKeepalive(item);
	if (!usableSocket(item.ws)) {
		dependencies.release(item.lane, item.requesterKey, item.requestKey);
		return;
	}
	try {
		Promise.resolve(dependencies.runRequest(
			item.lane,
			item.ws,
			item.data,
			item.enqueuedAt,
			item.requesterKey,
			item.requestKey
		)).catch(error => logFailure(dependencies, error));
	} catch (error) {
		logFailure(dependencies, error);
	}
}

/** Returns whether one websocket can still carry the exact request result. */
function usableSocket(webSocket) {
	return Boolean(
		webSocket?.opened ||
		typeof webSocket?.durableSend === "function"
	);
}

/** Reads the shared drain flag without taking ownership of the parent runtime state. */
function currentState(dependencies) {
	return typeof dependencies.state === "function"
		? dependencies.state()
		: dependencies.state;
}

/** Keeps custom test/config burst limits finite, positive, and event-loop friendly. */
function boundedBurstLimit(value) {
	const parsed = Math.floor(Number(value || DEFAULT_BURST_LIMIT));
	if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_BURST_LIMIT;
	return Math.min(parsed, MAX_BURST_LIMIT);
}

/** Reports one runner failure without stopping the remaining fair admissions in this burst. */
function logFailure(dependencies, error) {
	dependencies.log?.("warn", `runRequest failed: ${error?.message || error}`);
}

module.exports = {
	DEFAULT_BURST_LIMIT,
	MAX_BURST_LIMIT,
	boundedBurstLimit,
	createDrainRuntime,
	dispatchItem,
	usableSocket
};
