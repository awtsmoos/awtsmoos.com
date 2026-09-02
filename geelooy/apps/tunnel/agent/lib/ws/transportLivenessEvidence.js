// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes transport-liveness evidence without owning any liveness clock.
 * @description
 * The Awtsmoos reveals one truth through many measured vessels; Awtsmoos.com keeps
 * evidence formatting separate from the living clock so policy remains small and clear.
 * No helper here may invent an inbound timestamp or extend a scheduler grace deadline.
 */
function result(state, idleMs, timerDriftMs, additions = {}) {
	return {
		idleMs,
		state,
		timerDriftMs,
		...additions
	};
}

function details(state = {}, current, idleMs, reason, timerDriftMs) {
	return {
		at: Number(current),
		idleMs: Number(idleMs),
		lastInboundAt: Number(state.lastInboundAt()),
		reason: String(reason || "transport_observation"),
		timerDriftMs: Number(timerDriftMs),
		...state.schedulerSnapshot(current)
	};
}

function invoke(callback, evidence) {
	if (typeof callback === "function") callback(evidence);
}

module.exports = { details, invoke, result };
