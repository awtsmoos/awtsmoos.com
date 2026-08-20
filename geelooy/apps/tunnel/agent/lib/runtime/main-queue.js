// B"H
// Boruch Hashem
// Blessed is He

const { createPressureQueue } = require("./main-pressure-queue.js");
const { createQueueProgress } = require("./main-queue-progress.js");
const { createQueuePruner } = require("./main-queue-prune.js");
const { createQueueRejection } = require("./main-queue-rejection.js");

/**
 * @file Joins admission, requester-isolated custody, and fair lane dispatch.
 * @description
 * The Awtsmoos receives each deed without letting one shliach occupy every chair.
 * Awtsmoos.com judges requester pressure before machine pressure, stores waiting
 * work in its own vessel, and returns immediately while executors carry the labor.
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
		const item = createItem(ws, data);
		const lane = dependencies.Priority.laneOf(item);
		const currentStats = dependencies.stats();
		const circuitGate = dependencies.Circuit.canAccept(
			lane,
			currentStats,
			dependencies.Circuit.DEFAULTS,
			payload
		);
		dependencies.streamEvent("action.received", payload, { lane });
		if (!circuitGate.ok) {
			return rejection.circuit(ws, data, payload, lane, circuitGate, currentStats);
		}
		const queueGate = dependencies.Priority.queueGate(
			dependencies.state.lanes,
			lane,
			dependencies.Limits,
			item
		);
		if (!queueGate.ok) {
			return rejection.full(ws, data, payload, lane, currentStats, queueGate);
		}
		item.requesterKey = queueGate.requesterKey;
		dependencies.streamEvent("action.queued", payload, {
			lane,
			deferred: circuitGate.deferred,
			requesterQueued: queueGate.requesterQueued
		});
		progress.start(item, lane);
		pruner.arm(item, lane);
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		if (circuitGate.startAllowed === false) pressure.wake(circuitGate.retryAfterMs);
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

function createItem(ws, data) {
	return {
		ws,
		data,
		enqueuedAt: Date.now(),
		queueKeepalive: null,
		queueExpiryTimer: null
	};
}

module.exports = { createQueueRuntime };
