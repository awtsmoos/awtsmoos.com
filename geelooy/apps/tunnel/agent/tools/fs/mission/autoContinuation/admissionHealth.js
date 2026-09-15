//B"H
// Boruch Hashem
// Blessed is He

const SessionStore = require("../agentSessionStore.js");

const DEFAULT_TIMEOUT_MS = 180000;
const ACTIVE = new Set(["active", "working", "running"]);
const PENDING = new Set(["accepted", "scheduled"]);

/**
 * @file Reconciles browser dispatch with actual successor-session admission.
 * @description The Awtsmoos distinguishes a sent invitation from a living messenger;
 * Awtsmoos.com promotes witnessed sessions and expires ghost admissions for safe retry.
 */
function timeoutMs(options = {}) {
	const env = options.env || process.env;
	const raw = Number(
		options.admissionTimeoutMs
		|| env.AWTSMOOS_CONTINUATION_ADMISSION_TIMEOUT_MS
		|| DEFAULT_TIMEOUT_MS
	);
	return Number.isFinite(raw) ? Math.max(15000, Math.min(raw, 1800000)) : DEFAULT_TIMEOUT_MS;
}

async function joinedSession(config, identity = {}, record = {}) {
	const sessions = await SessionStore.all(config);
	const acceptedAt = Date.parse(record.acceptedAt || record.updatedAt || 0) || 0;
	return sessions.find(session => {
		const identityMatch = session.id === identity.successorAgentSessionId
			|| session.logicalAgentId === identity.successorAgentId;
		const missionMatch = !session.activeMissionId
			|| session.activeMissionId === identity.missionId;
		const fresh = !acceptedAt
			|| (Date.parse(session.startedAt || session.lastSeenAt || 0) || 0) >= acceptedAt - 5000;
		return identityMatch && missionMatch && fresh && ACTIVE.has(String(session.status || "active"));
	}) || null;
}

async function reconcile(config, state, record, identity = {}, options = {}) {
	if (!record || !PENDING.has(String(record.status || ""))) {
		return { record, joined: false, timedOut: false };
	}
	const session = await joinedSession(config, identity, record);
	if (session) {
		const next = state.mark(config, record, "running", {
			joinedAt: new Date().toISOString(),
			joinedSessionId: session.id,
			lastError: null
		});
		return { record: next, joined: true, timedOut: false, session };
	}
	const acceptedAt = Date.parse(record.acceptedAt || record.updatedAt || 0) || 0;
	const now = Number(options.now || Date.now());
	if (!acceptedAt || now - acceptedAt < timeoutMs(options)) {
		return { record, joined: false, timedOut: false };
	}
	const next = state.mark(config, record, "failed", {
		admissionTimedOutAt: new Date(now).toISOString(),
		lastError: "successor_admission_timeout"
	});
	return { record: next, joined: false, timedOut: true };
}

module.exports = { ACTIVE, DEFAULT_TIMEOUT_MS, PENDING, joinedSession, reconcile, timeoutMs };
