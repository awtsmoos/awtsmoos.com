// B"H
// Boruch Hashem
// Blessed is He

const QueueTruth = require("./queueTruth.js");
const { createSchedulerEscalation } = require("./schedulerEscalation.js");

/**
 * @file Repairs scheduler drift immediately and escalates only recurring corruption.
 * @description
 * The Awtsmoos renews every count from what truly exists; Awtsmoos.com first erases
 * a phantom shadow in place, then asks a verified native generation to be reborn only
 * if contradiction repeatedly returns after repair. Medicine cannot wait behind p1-p4.
 */
function createSchedulerIntegrity(options = {}) {
	const laneNames = options.laneNames || [];
	const getLanes = options.getLanes || (() => ({}));
	const onViolation = options.onViolation || (() => {});
	const intervalMs = Math.max(250, Number(options.intervalMs || 1000));
	const escalation = options.escalation || createSchedulerEscalation(options.escalationOptions);
	let timer = null;

	function reconcileLane(lane, state, reason) {
		const removedEmptyRequesters = pruneEmptyRequesters(state);
		const telemetry = QueueTruth.reconcileTelemetry(state);
		const impossible = telemetry.cachedQueued > 0 && telemetry.actualQueued === 0 ||
			telemetry.cachedInflight > 0 && telemetry.actualInflight === 0;
		const violated = telemetry.drift || impossible || removedEmptyRequesters > 0;
		const report = { lane, reason, violated, impossible, removedEmptyRequesters, ...telemetry };
		if (violated) {
			onViolation(report);
			escalation.observe(report);
		} else {
			escalation.healthy();
		}
		return report;
	}

	function reconcile(reason = "manual") {
		const lanes = getLanes();
		return laneNames.filter(lane => lanes[lane])
			.map(lane => reconcileLane(lane, lanes[lane], reason));
	}

	function start() {
		if (timer) return;
		timer = setInterval(() => reconcile("periodic"), intervalMs);
		timer.unref?.();
	}

	function stop() {
		if (!timer) return;
		clearInterval(timer);
		timer = null;
	}

	function status() {
		return { running: Boolean(timer), intervalMs, escalation: escalation.status() };
	}

	return { reconcile, reconcileLane, start, status, stop };
}

function pruneEmptyRequesters(state = {}) {
	if (!(state.requesterQueues instanceof Map)) return 0;
	let removed = 0;
	for (const [key, queue] of state.requesterQueues.entries()) {
		if (Array.isArray(queue) && queue.length > 0) continue;
		state.requesterQueues.delete(key);
		removed += 1;
	}
	if (!Array.isArray(state.requesterOrder)) return removed;
	state.requesterOrder = state.requesterOrder.filter(key => state.requesterQueues.has(key));
	if (state.cursor >= state.requesterOrder.length) state.cursor = 0;
	return removed;
}

module.exports = { createSchedulerIntegrity };
