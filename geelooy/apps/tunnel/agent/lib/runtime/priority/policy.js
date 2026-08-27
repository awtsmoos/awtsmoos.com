// B"H
// Boruch Hashem
// Blessed is He

const Classifier = require("./laneClassifier.js");
const FairQueue = require("./fairQueue.js");
const LegacyQueue = require("./legacyQueue.js");
const Scheduler = require("./laneScheduler.js");
const Requester = require("./requester.js");

/**
 * @file Joins weighted service lanes with requester-owned waiting vessels.
 * @description
 * The Awtsmoos grants each shliach a turn without granting any shliach the gate.
 * Awtsmoos.com checks local queue pressure before machine pressure, then rotates
 * eligible requesters so one slow or flooding agent can burden only its own path.
 */
function makeLaneState() {
	return Object.fromEntries(
		Classifier.LANE_ORDER.map(lane => [lane, FairQueue.createLaneState()])
	);
}

function enqueue(target, item) {
	if (Array.isArray(target)) return LegacyQueue.enqueue(target, item, Classifier.isPriority);
	const lane = Classifier.laneOf(item);
	item.lane = lane;
	FairQueue.enqueue(target[lane], item);
	return target;
}

function queuedCount(lanes = {}) {
	return Classifier.LANE_ORDER.reduce(
		(total, lane) => total + Number(lanes[lane]?.queued || 0),
		0
	);
}

function inflightCount(lanes = {}) {
	return Classifier.LANE_ORDER.reduce(
		(total, lane) => total + Number(lanes[lane]?.inflight || 0),
		0
	);
}

function canStartLane(lanes = {}, lane = "", limits = {}) {
	const current = lanes[lane];
	if (!current || current.queued < 1) return false;
	if (current.inflight >= Number(limits.LANE_LIMITS?.[lane] || 1)) return false;
	if (!isControlLane(lane) && inflightCount(lanes) >= Number(limits.MAX_INFLIGHT || 1)) {
		return false;
	}
	return Boolean(FairQueue.eligibleRequester(current, lane, limits));
}

function queueGate(lanes = {}, lane = "", limits = {}, item = {}) {
	const current = lanes[lane];
	const requesterKey = item.requesterKey || Requester.requesterKey(item);
	const requesterQueued = current?.requesterQueues?.get(requesterKey)?.length || 0;
	const requesterLimit = Number(limits.REQUESTER_QUEUE_LIMITS?.[lane] || Infinity);
	if (requesterQueued >= requesterLimit) {
		return gate(false, "requester_queue_full", requesterKey, requesterQueued, requesterLimit);
	}
	const machineLimit = queueLimit(lanes, lane, limits);
	const machineQueued = isControlLane(lane)
		? Number(current?.queued || 0)
		: queuedCount(lanes);
	if (machineQueued >= machineLimit) {
		return gate(false, "machine_queue_full", requesterKey, requesterQueued, requesterLimit);
	}
	return gate(true, "", requesterKey, requesterQueued, requesterLimit);
}

function queueLimit(lanes, lane, limits) {
	if (lane === Classifier.LANES.P0) return Number(limits.CONTROL_QUEUE_LIMIT || Infinity);
	if (lane === Classifier.LANES.P0_WAIT) return Number(limits.WAIT_QUEUE_LIMIT || Infinity);
	if (lane === Classifier.LANES.P0_OBSERVE) return Number(limits.OBSERVE_QUEUE_LIMIT || Infinity);
	return Number(limits.MAX_QUEUE || Infinity);
}

function gate(ok, reason, requesterKey, requesterQueued, requesterLimit) {
	return { ok, reason, requesterKey, requesterQueued, requesterLimit };
}

function canQueue(lanes, lane, limits, item = {}) {
	return queueGate(lanes, lane, limits, item).ok;
}

function nextLane(lanes, limits, scheduler) {
	return Scheduler.peekLane(scheduler, lane => canStartLane(lanes, lane, limits));
}

function takeNext(lanes, limits, scheduler) {
	const lane = Scheduler.takeLane(scheduler, candidate => canStartLane(lanes, candidate, limits));
	if (!lane) return null;
	const item = FairQueue.take(lanes[lane], lane, limits);
	if (item) item.lane = lane;
	return item;
}

function release(lanes, lane, requesterKey) {
	if (lanes[lane]) FairQueue.release(lanes[lane], requesterKey);
}

function isControlLane(lane) {
	return lane === Classifier.LANES.P0 ||
		lane === Classifier.LANES.P0_WAIT ||
		lane === Classifier.LANES.P0_OBSERVE;
}

module.exports = {
	...Classifier,
	canQueue,
	canStartLane,
	createSchedulerState: Scheduler.createSchedulerState,
	enqueue,
	inflightCount,
	makeLaneState,
	nextLane,
	queueGate,
	queuedCount,
	release,
	takeNext
};
