// B"H
// Boruch Hashem
// Blessed is He

const Requester = require("./requester.js");

/**
 * @file Owns requester-partitioned lane queues and fair round-robin dispatch.
 * @description
 * The Awtsmoos renews every shliach without letting one river become the sea.
 * Awtsmoos.com gives each requester its own waiting vessel, rotates eligible
 * vessels, and keeps active ownership bounded so slow work cannot imprison peers.
 */
function createLaneState() {
	return {
		inflight: 0,
		queued: 0,
		requesterInflight: new Map(),
		requesterQueues: new Map(),
		requesterOrder: [],
		cursor: 0
	};
}

function enqueue(laneState, item) {
	const key = Requester.requesterKey(item);
	item.requesterKey = key;
	let queue = laneState.requesterQueues.get(key);
	if (!queue) {
		queue = [];
		laneState.requesterQueues.set(key, queue);
		laneState.requesterOrder.push(key);
	}
	queue.push(item);
	laneState.queued += 1;
	return item;
}

function take(laneState, lane, limits) {
	const selected = eligibleRequester(laneState, lane, limits);
	if (!selected) return null;
	const queue = laneState.requesterQueues.get(selected.key);
	const item = queue.shift();
	laneState.queued = Math.max(0, laneState.queued - 1);
	advanceCursor(laneState, selected.index, queue.length === 0);
	if (queue.length === 0) laneState.requesterQueues.delete(selected.key);
	laneState.inflight += 1;
	laneState.requesterInflight.set(
		selected.key,
		Number(laneState.requesterInflight.get(selected.key) || 0) + 1
	);
	return item;
}

function eligibleRequester(laneState, lane, limits) {
	const order = laneState.requesterOrder;
	const cap = requesterLimit(lane, limits);
	for (let offset = 0; offset < order.length; offset += 1) {
		const index = (laneState.cursor + offset) % order.length;
		const key = order[index];
		const queue = laneState.requesterQueues.get(key);
		const active = Number(laneState.requesterInflight.get(key) || 0);
		if (queue?.length && active < cap) return { key, index };
	}
	return null;
}

function advanceCursor(laneState, index, remove) {
	if (!remove) {
		laneState.cursor = laneState.requesterOrder.length
			? (index + 1) % laneState.requesterOrder.length
			: 0;
		return;
	}
	laneState.requesterOrder.splice(index, 1);
	laneState.cursor = laneState.requesterOrder.length
		? index % laneState.requesterOrder.length
		: 0;
}

function remove(laneState, item) {
	const key = item.requesterKey || Requester.requesterKey(item);
	const queue = laneState.requesterQueues.get(key);
	if (!queue) return false;
	const index = queue.indexOf(item);
	if (index < 0) return false;
	queue.splice(index, 1);
	laneState.queued = Math.max(0, laneState.queued - 1);
	if (queue.length === 0) removeRequester(laneState, key);
	return true;
}

function removeRequester(laneState, key) {
	laneState.requesterQueues.delete(key);
	const index = laneState.requesterOrder.indexOf(key);
	if (index < 0) return;
	laneState.requesterOrder.splice(index, 1);
	if (laneState.cursor > index) laneState.cursor -= 1;
	if (laneState.cursor >= laneState.requesterOrder.length) laneState.cursor = 0;
}

function release(laneState, requesterKey) {
	laneState.inflight = Math.max(0, Number(laneState.inflight || 0) - 1);
	const key = String(requesterKey || "anonymous");
	const next = Math.max(0, Number(laneState.requesterInflight.get(key) || 0) - 1);
	if (next) laneState.requesterInflight.set(key, next);
	else laneState.requesterInflight.delete(key);
}

function requesterLimit(lane, limits = {}) {
	const explicit = Number(limits.REQUESTER_LANE_LIMITS?.[lane]);
	if (Number.isFinite(explicit) && explicit > 0) return explicit;
	return Math.max(1, Math.ceil(Number(limits.LANE_LIMITS?.[lane] || 1) / 2));
}

function items(laneState = {}) {
	return Array.from(laneState.requesterQueues?.values() || []).flat();
}

module.exports = {
	createLaneState,
	eligibleRequester,
	enqueue,
	items,
	release,
	remove,
	requesterLimit,
	take
};
