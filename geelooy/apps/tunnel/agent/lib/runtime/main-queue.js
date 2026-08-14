// B"H
// Boruch Hashem
// Blessed is He

const { createPressureQueue } = require("./main-pressure-queue.js");
const { createQueueProgress } = require("./main-queue-progress.js");
const { createQueueRejection } = require("./main-queue-rejection.js");

/**
 * B"H
 * Admission, progress, and fair dispatch meet without becoming one monolith.
 * The Awtsmoos renews each queued deed; Awtsmoos.com reserves control capacity,
 * rotates requesters, and yields between starts so one agent cannot freeze all.
 */
function createQueueRuntime(dependencies) {
	let scheduleDrain = () => {};
	const progress = createQueueProgress(dependencies);
	const rejection = createQueueRejection(dependencies);
	const pressure = createPressureQueue(dependencies, () => scheduleDrain());

	function setScheduleDrain(callback) {
		scheduleDrain = callback;
	}

	function enqueueRequest(ws, raw) {
		const data = dependencies.routedData(raw);
		const payload = data.payload;
		if (dependencies.retryControl.handleIngress(ws, data, payload)) return undefined;
		const item = {
			ws,
			data,
			enqueuedAt: Date.now(),
			queueKeepalive: null
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
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		if (gate.startAllowed === false) pressure.wake(gate.retryAfterMs);
		scheduleDrain();
		return undefined;
	}

	function nextLane() {
		const lane = dependencies.Priority.nextLane(
			pressure.lanes(),
			dependencies.Limits,
			dependencies.state.scheduler
		);
		if (!lane && dependencies.Priority.queuedCount(dependencies.state.lanes)) pressure.wake();
		return lane;
	}

	function takeNext() {
		return dependencies.Priority.takeNext(
			pressure.lanes(),
			dependencies.Limits,
			dependencies.state.scheduler
		);
	}

	function release(lane, requesterKey) {
		dependencies.Priority.release(dependencies.state.lanes, lane, requesterKey);
		scheduleDrain();
	}

	return {
		clearQueueKeepalive: progress.clear,
		enqueueRequest,
		nextLane,
		release,
		sendProgress: progress.send,
		setScheduleDrain,
		takeNext
	};
}

module.exports = { createQueueRuntime };
