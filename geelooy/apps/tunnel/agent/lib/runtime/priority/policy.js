// B"H
// Boruch Hashem
// Blessed is He

const Classifier = require("./laneClassifier.js");
const FairQueue = require("./fairQueue.js");
const LegacyQueue = require("./legacyQueue.js");
const Scheduler = require("./laneScheduler.js");
const Requester = require("./requester.js");

/**
 * B"H
 *
 * Scheduling preserves familiar lane arrays while adding requester isolation.
 * The Awtsmoos renews every queued deed; Awtsmoos.com grants weighted turns and
 * prevents one agent from consuming every running slot inside a shared lane.
 */
function makeLaneState() {
	return Object.fromEntries(
		Classifier.LANE_ORDER.map(lane => [lane, FairQueue.createLaneState()])
	);
}

function enqueue(target, item) {
	if (Array.isArray(target)) {
		return LegacyQueue.enqueue(target, item, Classifier.isPriority);
	}
	const lane = Classifier.laneOf(item);
	item.lane = lane;
	item.requesterKey = Requester.requesterKey(item);
	target[lane].queue.push(item);
	return target;
}

function queuedCount(lanes = {}) {
	return Classifier.LANE_ORDER.reduce(
		(total, lane) => total + (lanes[lane]?.queue.length || 0),
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
	if (!current?.queue.length) {
		return false;
	}
	if (current.inflight >= Number(limits.LANE_LIMITS?.[lane] || 1)) {
		return false;
	}
	if (
		lane !== Classifier.LANES.P0 &&
		lane !== Classifier.LANES.P0_WAIT &&
		inflightCount(lanes) >= Number(limits.MAX_INFLIGHT || 1)
	) {
		return false;
	}
	return FairQueue.hasEligible(current, lane, limits);
}

function canQueue(lanes = {}, lane = "", limits = {}) {
	if (lane === Classifier.LANES.P0) {
		return (lanes[lane]?.queue.length || 0) <
			Number(limits.CONTROL_QUEUE_LIMIT || 256);
	}
	if (lane === Classifier.LANES.P0_WAIT) {
		return (lanes[lane]?.queue.length || 0) <
			Number(limits.WAIT_QUEUE_LIMIT || 4096);
	}
	return queuedCount(lanes) < Number(limits.MAX_QUEUE || 0);
}

function nextLane(lanes, limits, scheduler) {
	return Scheduler.peekLane(
		scheduler,
		lane => canStartLane(lanes, lane, limits)
	);
}

function takeNext(lanes, limits, scheduler) {
	const lane = Scheduler.takeLane(
		scheduler,
		candidate => canStartLane(lanes, candidate, limits)
	);
	if (!lane) {
		return null;
	}
	const item = FairQueue.take(lanes[lane], lane, limits);
	if (item) {
		item.lane = lane;
	}
	return item;
}

function release(lanes, lane, requesterKey) {
	if (lanes[lane]) {
		FairQueue.release(lanes[lane], requesterKey);
	}
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
	queuedCount,
	release,
	takeNext
};
