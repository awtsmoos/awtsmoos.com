// B"H
// Boruch Hashem
// Blessed is He

const QueueTruth = require("./queueTruth.js");
const Requester = require("./requester.js");

/**
 * @file Owns requester-local queue rotation for the fair scheduler.
 * @description
 * The Awtsmoos gives every logical shliach a measured turn. Awtsmoos.com keeps
 * requester buckets canonical, removes empty vessels immediately, and never lets
 * a copied counter become the authority that decides who may proceed.
 */
function enqueue(laneState, item) {
	const identity = Requester.requestIdentity(item);
	const requesterKey = `logicalAgentId:${identity.logicalAgentId}`;
	item.requestIdentity = identity;
	item.requestKey = identity.requestKey;
	item.requesterKey = requesterKey;
	let queue = laneState.requesterQueues.get(requesterKey);
	if (!queue) {
		queue = [];
		laneState.requesterQueues.set(requesterKey, queue);
		laneState.requesterOrder.push(requesterKey);
	}
	queue.push(item);
	QueueTruth.reconcileTelemetry(laneState);
	return item;
}

function eligible(laneState, lane, limits) {
	const order = laneState.requesterOrder;
	const cap = requesterLimit(lane, limits);
	for (let offset = 0; offset < order.length; offset += 1) {
		const index = (laneState.cursor + offset) % order.length;
		const key = order[index];
		const queue = laneState.requesterQueues.get(key);
		const active = QueueTruth.requesterInflight(laneState, key);
		if (queue?.length && active < cap) return { key, index };
	}
	return null;
}

function remove(laneState, item) {
	const key = item.requesterKey || Requester.requesterKey(item);
	const queue = laneState.requesterQueues.get(key);
	if (!queue) return false;
	const index = queue.indexOf(item);
	if (index < 0) return false;
	queue.splice(index, 1);
	if (queue.length === 0) removeRequester(laneState, key);
	QueueTruth.reconcileTelemetry(laneState);
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

function advance(laneState, index, removeEmpty) {
	if (removeEmpty) {
		laneState.requesterOrder.splice(index, 1);
		laneState.cursor = laneState.requesterOrder.length
			? index % laneState.requesterOrder.length
			: 0;
		return;
	}
	laneState.cursor = laneState.requesterOrder.length
		? (index + 1) % laneState.requesterOrder.length
		: 0;
}

function requesterLimit(lane, limits = {}) {
	const explicit = Number(limits.REQUESTER_LANE_LIMITS?.[lane]);
	if (Number.isFinite(explicit) && explicit > 0) return explicit;
	return Math.max(1, Math.ceil(Number(limits.LANE_LIMITS?.[lane] || 1) / 2));
}

function items(laneState = {}) {
	return Array.from(laneState.requesterQueues?.values() || []).flat();
}

module.exports = { advance, eligible, enqueue, items, remove, removeRequester, requesterLimit };
