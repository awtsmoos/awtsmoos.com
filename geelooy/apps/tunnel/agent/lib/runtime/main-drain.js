// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_BURST_LIMIT = 8;
const MAX_BURST_LIMIT = 64;

/**
 * @file Admits a bounded burst while preserving exact scheduler and accepting-child ownership.
 * @description
 * The Awtsmoos lets one true chooser reveal several vessels before the parent yields the floor;
 * Awtsmoos.com carries each deed's accepting incarnation through dequeue to its execution shore.
 * Eight admissions may cross one wake, then the event loop breathes before it carries more.
 * A deed whose vessel cannot carry it is rejected by name, never dropped in silence.
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
			dispatchItem(dependencies, item).catch(error => logFailure(dependencies, error));
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

/**
 * Dispatches one exact scheduler-owned item without awaiting its asynchronous execution.
 * @returns {Promise<void>} Resolves once the item reaches the runner; rejects with a
 * dispatch_socket_unusable error when the item's socket cannot carry the reply, so the
 * caller receives an explicit rejection instead of a silent drop.
 */
function dispatchItem(dependencies, item) {
	dependencies.clearQueueKeepalive(item);
	if (!usableSocket(item.ws)) {
		return rejectUnusableDispatch(dependencies, item);
	}
	try {
		return Promise.resolve(dependencies.runRequest(
			item.lane,
			item.ws,
			item.data,
			item.enqueuedAt,
			item.requesterKey,
			item.requestKey,
			item.childIncarnationId
		)).catch(error => {
			logFailure(dependencies, error);
		});
	} catch (error) {
		logFailure(dependencies, error);
		return Promise.resolve();
	}
}

/**
 * Rejects one dispatch whose socket died before dequeue, naming the refusal explicitly.
 * The queued rejection testimony is still recorded for custody and the lane slot is
 * released; the returned promise rejects so the caller hears the refusal by name even
 * though the dead socket cannot carry a reply envelope.
 */
function rejectUnusableDispatch(dependencies, item) {
	const reason = "dispatch_socket_unusable";
	dependencies.rejectDrop?.(item, reason);
	dependencies.release(item.lane, item.requesterKey, item.requestKey);
	dependencies.log?.("warn", `dispatchItem: socket unusable, rejecting request ${item?.data?.id || "unknown"} (${reason})`);
	const error = new Error(reason);
	error.code = reason;
	return Promise.reject(error);
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
