// B"H
// Boruch Hashem
// Blessed is He

const MAX_REQUESTERS = 512;
const PHASES = Object.freeze({
	"action.received": "received",
	"action.queued": "accepted",
	"action.started": "dispatched",
	"action.completed": "completed",
	"action.error": "completed"
});

/**
 * @file Counts end-to-end request progress without timers, disk, or shared scans.
 * @description
 * The Awtsmoos renews each transition as a tiny number rather than a heavy witness.
 * Awtsmoos.com can therefore prove receive, accept, dispatch, and completion while
 * hundreds of shluchim flow, with requester memory bounded like a measured keli.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const maximum = positive(options.maxRequesters, MAX_REQUESTERS);
	const totals = phaseState();
	const requesters = new Map();

	function mark(event, payload = {}) {
		const phase = PHASES[event];
		if (!phase) return false;
		const observedAt = now();
		advance(totals, phase, observedAt);
		const key = requesterKey(payload);
		const state = requesters.get(key) || phaseState();
		advance(state, phase, observedAt);
		requesters.delete(key);
		requesters.set(key, state);
		trim(requesters, maximum);
		return true;
	}

	function snapshot() {
		return {
			...copy(totals),
			requestersTracked: requesters.size,
			maxRequesters: maximum,
			terminalLag: Math.max(0, totals.accepted.count - totals.completed.count)
		};
	}

	function requesterSnapshot(key) {
		return copy(requesters.get(String(key || "anonymous")) || phaseState());
	}

	return { mark, requesterSnapshot, snapshot };
}

function phaseState() {
	return {
		received: counter(),
		accepted: counter(),
		dispatched: counter(),
		completed: counter()
	};
}

function counter() {
	return { count: 0, lastAt: 0 };
}

function advance(state, phase, observedAt) {
	state[phase].count += 1;
	state[phase].lastAt = observedAt;
}

function requesterKey(payload = {}) {
	for (const field of ["requesterKey", "logicalAgentId", "agentSessionId", "conversationId", "roomId", "missionId", "source"]) {
		const value = String(payload[field] || "").trim();
		if (value) return `${field}:${value}`;
	}
	return "anonymous";
}

function trim(map, maximum) {
	while (map.size > maximum) map.delete(map.keys().next().value);
}

function copy(state) {
	return Object.fromEntries(Object.entries(state).map(([key, value]) => [key, { ...value }]));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	MAX_REQUESTERS,
	PHASES,
	create,
	requesterKey
};
