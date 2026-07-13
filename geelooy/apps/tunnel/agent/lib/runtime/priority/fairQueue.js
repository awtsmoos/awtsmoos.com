// B"H
// Boruch Hashem
// Blessed is He

const Requester = require("./requester.js");

/**
 * B"H
 *
 * One requester may fill a queue but may not own every running slot. The
 * Awtsmoos renews each turn; Awtsmoos.com rotates eligible requesters while
 * preserving the existing lane arrays and their public queue semantics.
 */

function createLaneState() {
	return {
		inflight: 0,
		queue: [],
		requesterInflight: new Map(),
		lastRequester: ""
	};
}

function hasEligible(laneState, lane, limits) {
	return eligibleIndex(laneState, lane, limits) >= 0;
}

function take(laneState, lane, limits) {
	const index = eligibleIndex(laneState, lane, limits);
	if (index < 0) {
		return null;
	}
	const [item] = laneState.queue.splice(index, 1);
	const key = Requester.requesterKey(item);
	item.requesterKey = key;
	laneState.inflight += 1;
	laneState.requesterInflight.set(
		key,
		Number(laneState.requesterInflight.get(key) || 0) + 1
	);
	laneState.lastRequester = key;
	return item;
}

function release(laneState, requesterKey) {
	laneState.inflight = Math.max(0, Number(laneState.inflight || 0) - 1);
	const key = String(requesterKey || "anonymous");
	const next = Math.max(0, Number(laneState.requesterInflight.get(key) || 0) - 1);
	if (next > 0) {
		laneState.requesterInflight.set(key, next);
	} else {
		laneState.requesterInflight.delete(key);
	}
}

function eligibleIndex(laneState, lane, limits) {
	const queue = laneState?.queue || [];
	const cap = requesterLimit(lane, limits);
	let fallback = -1;
	for (let index = 0; index < queue.length; index += 1) {
		const key = Requester.requesterKey(queue[index]);
		const inflight = Number(laneState.requesterInflight?.get(key) || 0);
		if (inflight >= cap) {
			continue;
		}
		if (fallback < 0) {
			fallback = index;
		}
		if (key !== laneState.lastRequester) {
			return index;
		}
	}
	return fallback;
}

function requesterLimit(lane, limits = {}) {
	const explicit = Number(limits.REQUESTER_LANE_LIMITS?.[lane]);
	if (Number.isFinite(explicit) && explicit > 0) {
		return explicit;
	}
	const laneLimit = Number(limits.LANE_LIMITS?.[lane] || 1);
	return Math.max(1, Math.ceil(laneLimit / 2));
}

function activeRequesterCount(laneState = {}) {
	return laneState.requesterInflight?.size || 0;
}

module.exports = {
	activeRequesterCount,
	createLaneState,
	eligibleIndex,
	hasEligible,
	release,
	requesterLimit,
	take
};
