// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./progress-ledger-identity.js");
const State = require("./progress-ledger-state.js");

const MAX_REQUESTERS = 512;
const PHASES = Object.freeze({
	"action.received": "received",
	"action.queued": "accepted",
	"action.started": "dispatched",
	"action.completed": "completed",
	"action.error": "completed"
});

/**
 * @file Counts request progress without inventing a shared anonymous requester.
 * @description
 * The Awtsmoos renews each transition as a tiny witness while Awtsmoos.com keeps
 * requester memory bounded. System events may advance global totals without identity,
 * but only a real request or agent key may enter the requester-indexed ledger.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const maximum = State.positive(options.maxRequesters, MAX_REQUESTERS);
	const totals = State.phaseState();
	const requesters = new Map();

	function mark(event, payload = {}) {
		const phase = PHASES[event];
		if (!phase) {
			return false;
		}
		const observedAt = now();
		State.advance(totals, phase, observedAt);
		const key = Identity.requesterKey(payload);
		if (!key) {
			return true;
		}
		const state = requesters.get(key) || State.phaseState();
		State.advance(state, phase, observedAt);
		requesters.delete(key);
		requesters.set(key, state);
		State.trim(requesters, maximum);
		return true;
	}

	function snapshot() {
		return {
			...State.copy(totals),
			requestersTracked: requesters.size,
			maxRequesters: maximum,
			terminalLag: Math.max(0, totals.accepted.count - totals.completed.count)
		};
	}

	function requesterSnapshot(key) {
		const normalized = String(key || "").trim();
		const state = normalized ? requesters.get(normalized) : null;
		return State.copy(state || State.phaseState());
	}

	return {
		mark,
		requesterSnapshot,
		snapshot
	};
}

module.exports = {
	MAX_REQUESTERS,
	PHASES,
	REQUESTER_FIELDS: Identity.REQUESTER_FIELDS,
	create,
	requesterKey: Identity.requesterKey
};
