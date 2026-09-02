// B"H
// Boruch Hashem
// Blessed is He

const { admissionGate } = require("./main-queue-admission.js");
const { registerQueueEmergencyController } = require("./main-queue-emergency.js");
const { createPressureQueue } = require("./main-pressure-queue.js");
const { createQueueProgress } = require("./main-queue-progress.js");
const { createQueuePruner } = require("./main-queue-prune.js");
const { createQueueRejection } = require("./main-queue-rejection.js");
const { createSchedulerIntegrity } = require("./priority/schedulerIntegrity.js");

/**
 * @file Joins exact request identity, accepting-child provenance, admission telemetry, and dispatch.
 * @description
 * The Awtsmoos receives each deed in one living vessel; Awtsmoos.com preserves which child first knew it,
 * so every later phase can refresh only that custody while fair lanes reveal the truth they carry through it.
 */
function createQueueRuntime(dependencies) {
	let scheduleDrain = () => {};
	const progress = createQueueProgress(dependencies);
	const rejection = createQueueRejection(dependencies);
	const pressure = createPressureQueue(dependencies, () => scheduleDrain());
	const pruner = createQueuePruner(dependencies, rejection, progress, () => scheduleDrain());
	const integrity = createSchedulerIntegrity({
		laneNames: dependencies.Priority.LANE_ORDER,
		getLanes: () => dependencies.state.lanes,
		intervalMs: 1000
	});
	integrity.start();
	registerQueueEmergencyController(dependencies, integrity);

	function setScheduleDrain(callback) {
		scheduleDrain = callback;
	}

	function enqueueRequest(ws, raw, childIncarnationId = "") {
		const data = dependencies.routedData(raw);
		const payload = data.payload;
		if (dependencies.retryControl.handleIngress(ws, data, payload)) return undefined;
		integrity.reconcile("before_enqueue");
		pruner.prune();
		const item = createItem(ws, data, childIncarnationId);
		const lane = dependencies.Priority.laneOf(item);
		const currentStats = dependencies.stats();
		const circuitGate = dependencies.Circuit.canAccept(
			lane, currentStats, dependencies.Circuit.DEFAULTS, payload
		);
		dependencies.streamEvent("action.received", payload, { lane });
		if (!circuitGate.ok) {
			return rejection.circuit(ws, data, payload, lane, circuitGate, currentStats);
		}
		const queueGate = admissionGate(dependencies, rejection, ws, data, item, lane);
		if (!queueGate) return undefined;
		if (!queueGate.ok) {
			return rejection.full(ws, data, payload, lane, currentStats, queueGate);
		}
		item.requesterKey = queueGate.requesterKey;
		progress.start(item, lane);
		pruner.arm(item, lane);
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		dependencies.streamEvent("action.queued", payload, { lane });
		integrity.reconcile("after_enqueue");
		if (circuitGate.startAllowed === false) pressure.wake(circuitGate.retryAfterMs);
		scheduleDrain();
		return undefined;
	}

	function nextLane() {
		integrity.reconcile("before_peek");
		pruner.prune();
		return dependencies.Priority.nextLane(
			pressure.lanes(), dependencies.Limits, dependencies.state.scheduler, pressure.mayStart
		);
	}

	function takeNext() {
		integrity.reconcile("before_take");
		pruner.prune();
		const item = dependencies.Priority.takeNext(
			pressure.lanes(), dependencies.Limits, dependencies.state.scheduler, pressure.mayStart
		);
		if (item) pruner.clear(item);
		integrity.reconcile("after_take");
		return item;
	}

	function release(lane, requesterKey, requestKey) {
		dependencies.Priority.release(dependencies.state.lanes, lane, requesterKey, requestKey);
		integrity.reconcile("after_release");
		scheduleDrain();
	}

	return {
		clearQueueKeepalive: progress.clear,
		enqueueRequest,
		nextLane,
		pruneQueued: pruner.prune,
		reconcileScheduler: integrity.reconcile,
		release,
		sendProgress: progress.send,
		setScheduleDrain,
		takeNext
	};
}

function createItem(ws, data, childIncarnationId) {
	return {
		ws,
		data,
		childIncarnationId: String(childIncarnationId || "").trim(),
		enqueuedAt: Date.now(),
		queueKeepalive: null,
		queueExpiryTimer: null
	};
}

module.exports = { createQueueRuntime };
