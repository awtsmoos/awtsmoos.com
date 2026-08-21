// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reconstructs scheduler telemetry from living queue and ownership structures.
 * @description
 * The Awtsmoos renews every vessel, so Awtsmoos.com never lets a remembered number
 * outrank the living contents it claims to describe. Cached counters are shadows:
 * useful for display, disposable for truth, and rebuilt whenever they disagree.
 */
function queuedCount(laneState = {}) {
	let total = 0;
	for (const queue of laneState.requesterQueues?.values?.() || []) {
		if (Array.isArray(queue)) total += queue.length;
	}
	return total;
}

function inflightCount(laneState = {}) {
	if (laneState.inflightRequests instanceof Map) {
		return laneState.inflightRequests.size;
	}
	let total = 0;
	for (const count of laneState.requesterInflight?.values?.() || []) {
		total += Math.max(0, Number(count || 0));
	}
	return total;
}

function requesterQueued(laneState = {}, requesterKey = "") {
	return laneState.requesterQueues?.get?.(requesterKey)?.length || 0;
}

function requesterInflight(laneState = {}, requesterKey = "") {
	if (!(laneState.inflightRequests instanceof Map)) {
		return Math.max(0, Number(laneState.requesterInflight?.get?.(requesterKey) || 0));
	}
	let total = 0;
	for (const ownership of laneState.inflightRequests.values()) {
		if (ownership?.requesterKey === requesterKey) total += 1;
	}
	return total;
}

function snapshot(laneState = {}) {
	return {
		actualQueued: queuedCount(laneState),
		actualInflight: inflightCount(laneState),
		cachedQueued: Number(laneState.queued || 0),
		cachedInflight: Number(laneState.inflight || 0),
		queuedRequesters: Number(laneState.requesterQueues?.size || 0),
		inflightOwners: Number(laneState.inflightRequests?.size || 0)
	};
}

function rebuildRequesterInflight(laneState = {}) {
	if (!(laneState.requesterInflight instanceof Map)) return;
	laneState.requesterInflight.clear();
	for (const ownership of laneState.inflightRequests?.values?.() || []) {
		const key = ownership?.requesterKey;
		if (!key) continue;
		const count = Number(laneState.requesterInflight.get(key) || 0);
		laneState.requesterInflight.set(key, count + 1);
	}
}

function reconcileTelemetry(laneState = {}, observedAt = Date.now()) {
	const before = snapshot(laneState);
	laneState.queued = before.actualQueued;
	laneState.inflight = before.actualInflight;
	rebuildRequesterInflight(laneState);
	const drift = before.cachedQueued !== before.actualQueued ||
		before.cachedInflight !== before.actualInflight;
	if (drift) {
		laneState.integrity = {
			violations: Number(laneState.integrity?.violations || 0) + 1,
			lastAt: observedAt,
			lastDrift: before
		};
	}
	return {
		...before,
		drift
	};
}

module.exports = {
	inflightCount,
	queuedCount,
	reconcileTelemetry,
	rebuildRequesterInflight,
	requesterInflight,
	requesterQueued,
	snapshot
};
