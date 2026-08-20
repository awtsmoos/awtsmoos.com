// B"H
// Boruch Hashem
// Blessed is He

const { createPressureQueue } = require("./main-pressure-queue.js");
const { createQueueProgress } = require("./main-queue-progress.js");
const { createQueuePruner } = require("./main-queue-prune.js");
const { createQueueRejection } = require("./main-queue-rejection.js");

/**
 * @file Joins admission, bounded queue custody, and fair lane dispatch.
 * @description
 * The Awtsmoos renews each waiting deed without pretending waiting is execution;
 * Awtsmoos.com expires only queue custody, clears its timers, and preserves running work untouched.
 */
function createQueueRuntime(dependencies) {
	let scheduleDrain = () => {};
	const progress = createQueueProgress(dependencies);
	const rejection = createQueueRejection(dependencies);
	const pressure = createPressureQueue(dependencies, () => scheduleDrain());
	const pruner = createQueuePruner(dependencies, rejection, progress, () => scheduleDrain());

	function setScheduleDrain(callback) {
		scheduleDrain = callback;
	}

	function enqueueRequest(ws, raw) {
		const data = dependencies.routedData(raw);
		const payload = data.payload;
		if (dependencies.retryControl.handleIngress(ws, data, payload)) return undefined;
		pruner.prune();
		const item = {
			ws,
			data,
			enqueuedAt: Date.now(),
			queueKeepalive: null,
			queueExpiryTimer: null
		};
		const lane = dependencies.Priority.laneOf(item);
		const currentStats = dependencies.stats();
		const gate = dependencies.Circuit.canAccept(
			lane,
			currentStats,
			dependencies.Circuit.DEFAULTS,
			payload
		);
		dependencies.streamEvent("action.received", payload, { lane });
		if (!gate.ok) return rejection.circuit(ws, data, payload, lane, gate, currentStats);
		if (!dependencies.Priority.canQueue(
			dependencies.state.lanes,
			lane,
			dependencies.Limits
		)) return rejection.full(ws, data, payload, lane, currentStats);
		dependencies.streamEvent("action.queued", payload, { lane, deferred: gate.deferred });
		progress.start(item, lane);
		pruner.arm(item, lane);
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		if (gate.startAllowed === false) pressure.wake(gate.retryAfterMs);
		scheduleDrain();
		return undefined;
	}

	function nextLane() {
		pruner.prune();
		const lane = dependencies.Priority.nextLane(
			pressure.lanes(),
			dependencies.Limits,
			dependencies.state.scheduler
		);
		if (!lane && dependencies.Priority.queuedCount(dependencies.state.lanes)) pressure.wake();
		return lane;
	}

	function takeNext() {
		pruner.prune();
		const item = dependencies.Priority.takeNext(
			pressure.lanes(),
			dependencies.Limits,
			dependencies.state.scheduler
		);
		if (item) pruner.clear(item);
		return item;
	}

	function release(lane, requesterKey) {
		dependencies.Priority.release(dependencies.state.lanes, lane, requesterKey);
		scheduleDrain();
	}

	return {
		clearQueueKeepalive: progress.clear,
		enqueueRequest,
		nextLane,
		pruneQueued: pruner.prune,
		release,
		sendProgress: progress.send,
		setScheduleDrain,
		takeNext
	};
}

module.exports = { createQueueRuntime };
