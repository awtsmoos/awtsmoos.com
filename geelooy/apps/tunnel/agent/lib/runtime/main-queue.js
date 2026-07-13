// B"H
// Boruch Hashem
// Blessed is He

const { createQueueProgress } = require("./main-queue-progress.js");
const { createQueueRejection } = require("./main-queue-rejection.js");

/**
 * B"H
 *
 * Admission, progress, and fair dispatch meet without becoming one monolith.
 * The Awtsmoos renews each queued deed; Awtsmoos.com reserves control capacity,
 * rotates requesters, and yields between starts so one agent cannot freeze all.
 */
function createQueueRuntime(dependencies) {
	let scheduleDrain = () => {};
	const progress = createQueueProgress(dependencies);
	const rejection = createQueueRejection(dependencies);

	function setScheduleDrain(callback) {
		scheduleDrain = callback;
	}

	function enqueueRequest(ws, raw) {
		const data = dependencies.routedData(raw);
		const payload = data.payload;
		if (dependencies.retryControl.handleIngress(ws, data, payload)) {
			return undefined;
		}
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
		if (!gate.ok) {
			return rejection.circuit(ws, data, payload, lane, gate, currentStats);
		}
		if (!dependencies.Priority.canQueue(
			dependencies.state.lanes,
			lane,
			dependencies.Limits
		)) {
			return rejection.full(ws, data, payload, lane, currentStats);
		}
		dependencies.streamEvent("action.queued", payload, { lane });
		progress.start(item, lane);
		dependencies.Priority.enqueue(dependencies.state.lanes, item);
		scheduleDrain();
		return undefined;
	}

	function nextLane() {
		return dependencies.Priority.nextLane(
			dependencies.state.lanes,
			dependencies.Limits,
			dependencies.state.scheduler
		);
	}

	function takeNext() {
		return dependencies.Priority.takeNext(
			dependencies.state.lanes,
			dependencies.Limits,
			dependencies.state.scheduler
		);
	}

	function release(lane, requesterKey) {
		dependencies.Priority.release(
			dependencies.state.lanes,
			lane,
			requesterKey
		);
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

module.exports = {
	createQueueRuntime
};
