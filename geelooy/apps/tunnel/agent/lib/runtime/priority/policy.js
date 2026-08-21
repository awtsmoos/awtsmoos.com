// B"H
// Boruch Hashem
// Blessed is He

const Admission = require("./admissionPolicy.js");
const Classifier = require("./laneClassifier.js");
const FairQueue = require("./fairQueue.js");
const LegacyQueue = require("./legacyQueue.js");
const QueueTruth = require("./queueTruth.js");
const Requester = require("./requester.js");
const Scheduler = require("./laneScheduler.js");

/**
 * @file Governs fair admission from authoritative scheduler state.
 * @description
 * The Awtsmoos gives each shliach a bounded road while Awtsmoos.com derives every
 * pressure decision from living queues and exact ownership, never cached shadows.
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
		(total, lane) => total + QueueTruth.queuedCount(lanes[lane]), 0
	);
}

function inflightCount(lanes = {}) {
	return Classifier.LANE_ORDER.reduce(
		(total, lane) => total + QueueTruth.inflightCount(lanes[lane]), 0
	);
}

function canStartLane(lanes, lane, limits, mayStart = () => true) {
	const state = lanes?.[lane];
	if (!state || !mayStart(lane)) return false;
	if (QueueTruth.queuedCount(state) < 1) return false;
	if (QueueTruth.inflightCount(state) >= Number(limits.LANE_LIMITS?.[lane] || 1)) return false;
	if (!Admission.isControlLane(Classifier, lane) && inflightCount(lanes) >= Number(limits.MAX_INFLIGHT || 1)) {
		return false;
	}
	return Boolean(FairQueue.eligibleRequester(state, lane, limits));
}

function queueGate(lanes = {}, lane = "", limits = {}, item = {}) {
	const state = lanes[lane];
	if (!state) return Admission.gate(false, "unknown_lane", "", 0, 0);
	const identity = Requester.requestIdentity(item);
	const requesterKey = `logicalAgentId:${identity.logicalAgentId}`;
	const requesterQueued = QueueTruth.requesterQueued(state, requesterKey);
	const requesterLimit = Number(limits.REQUESTER_QUEUE_LIMITS?.[lane] || Infinity);
	if (requesterQueued >= requesterLimit) {
		return Admission.gate(false, "requester_queue_full", requesterKey, requesterQueued, requesterLimit);
	}
	const machineQueued = Admission.isControlLane(Classifier, lane)
		? QueueTruth.queuedCount(state)
		: queuedCount(lanes);
	if (machineQueued >= Admission.queueLimit(Classifier, lane, limits)) {
		return Admission.gate(false, "machine_queue_full", requesterKey, requesterQueued, requesterLimit);
	}
	return Admission.gate(true, "", requesterKey, requesterQueued, requesterLimit);
}

function nextLane(lanes, limits, scheduler, mayStart) {
	return Scheduler.peekLane(
		scheduler, lane => canStartLane(lanes, lane, limits, mayStart)
	);
}

function takeNext(lanes, limits, scheduler, mayStart) {
	const lane = Scheduler.takeLane(
		scheduler, candidate => canStartLane(lanes, candidate, limits, mayStart)
	);
	if (!lane) return null;
	const item = FairQueue.take(lanes[lane], lane, limits);
	if (item) item.lane = lane;
	return item;
}

function release(lanes, lane, requesterKey, requestKey) {
	return lanes[lane] ? FairQueue.release(lanes[lane], requesterKey, requestKey) : false;
}

function reconcile(lanes = {}) {
	return Object.fromEntries(
		Classifier.LANE_ORDER.map(lane => [lane, QueueTruth.reconcileTelemetry(lanes[lane])])
	);
}

module.exports = {
	...Classifier,
	canQueue: (lanes, lane, limits, item) => queueGate(lanes, lane, limits, item).ok,
	createSchedulerState: Scheduler.createSchedulerState, enqueue, inflightCount, makeLaneState,
	nextLane, queueGate, queuedCount, reconcile, release,
	requestIdentity: Requester.requestIdentity, requestKey: Requester.requestKey,
	requesterKey: Requester.requesterKey, takeNext
};
