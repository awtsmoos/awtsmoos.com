//B"H // Boruch Hashem // Blessed is He

const AdmissionResult = require("./main-queue-admission-result.js");
const EmergencyDispatch = require("./main-queue-emergency-dispatch.js");
const QueueItem = require("./main-queue-item.js");
const { admissionGate } = require("./main-queue-admission.js");
const { registerQueueEmergencyController } = require("./main-queue-emergency.js");
const { createPressureQueue } = require("./main-pressure-queue.js");
const { createQueueProgress } = require("./main-queue-progress.js");
const { createQueuePruner } = require("./main-queue-prune.js");
const { createQueueRejection } = require("./main-queue-rejection.js");
const { createSchedulerIntegrity } = require("./priority/schedulerIntegrity.js");

/**
 * @file Joins exact request identity, parent-owned emergency deeds, admission testimony, and fair dispatch.
 * @description
 * The Awtsmoos receives each deed in one living vessel. Awtsmoos.com now settles scheduler emergency
 * control in the parent that owns the scheduler, while ordinary deeds enter the same guarded lanes as
 * before, so a worker process can never mistake its empty module memory for native scheduler death.
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
		if (dependencies.retryControl.handleIngress(ws, data, payload)) {
			return AdmissionResult.rejected("ingress_resolved");
		}
		if (EmergencyDispatch.handle(dependencies, ws, data, payload)) {
			return AdmissionResult.rejected("parent_emergency_resolved");
		}
		integrity.reconcile("before_enqueue");
		pruner.prune();
		const item = QueueItem.createQueueItem(ws, data, childIncarnationId);
		const lane = dependencies.Priority.laneOf(item);
		const currentStats = dependencies.stats();
		const circuitGate = dependencies.Circuit.canAccept(
			lane, currentStats, dependencies.Circuit.DEFAULTS, payload
		);
		dependencies.streamEvent("action.received", payload, { lane });
		if (!circuitGate.ok) {
			rejection.circuit(ws, data, payload, lane, circuitGate, currentStats);
			return AdmissionResult.rejected(circuitGate.reason || "circuit_rejected");
		}
		const queueGate = admissionGate(dependencies, rejection, ws, data, item, lane);
		if (!queueGate) return AdmissionResult.rejected("identity_rejected");
		if (!queueGate.ok) {
			rejection.full(ws, data, payload, lane, currentStats, queueGate);
			return AdmissionResult.rejected(queueGate.reason || "queue_rejected");
		}
		item.requesterKey = queueGate.requesterKey;
		progress.start(item, lane);
		pruner.arm(item, lane);
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		dependencies.streamEvent("action.queued", payload, { lane });
		integrity.reconcile("after_enqueue");
		if (circuitGate.startAllowed === false) pressure.wake(circuitGate.retryAfterMs);
		scheduleDrain();
		return AdmissionResult.accepted(lane);
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

module.exports = { createQueueRuntime };
