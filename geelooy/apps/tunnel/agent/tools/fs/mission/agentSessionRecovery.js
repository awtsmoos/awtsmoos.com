//B"H
//Boruch Hashem
//Blessed be He

const Store = require("./agentSessionStore.js");

const ACTIVE = new Set(["launching", "active", "working", "waiting", "recovering"]);
const DEFAULT_STALE_MS = 15 * 60 * 1000;
const DEFAULT_REQUEST_COOLDOWN_MS = 2 * 60 * 1000;

/**
 * @file Detects disposable chat loss without converting it into mission failure.
 * @description
 * Exhausted or stale conversations become fenced replacement requests. Their durable mission,
 * remaining work, evidence, paths, and peer context stay untouched for the next Shliach.
 */
function needsReplacement(session = {}, options = {}) {
	const now = Number(options.now || Date.now());
	const cooldownMs = Math.max(30_000, Number(
		options.replacementCooldownMs || DEFAULT_REQUEST_COOLDOWN_MS
	));
	const requestedAt = Date.parse(session.replacementRequestedAt || 0);
	if (Number.isFinite(requestedAt) && now - requestedAt < cooldownMs) return false;
	if (session.replacementNeeded) return true;
	if (!ACTIVE.has(String(session.status || ""))) return false;
	const staleMs = Math.max(60_000, Number(options.staleMs || DEFAULT_STALE_MS));
	const lastSeen = Date.parse(session.lastSeenAt || session.startedAt || 0);
	return Number.isFinite(lastSeen) && now - lastSeen > staleMs;
}

/** Finds every dead/exhausted session that should receive a new browser vessel. */
async function candidates(config, options = {}) {
	const sessions = await Store.all(config);
	return sessions.filter(session => needsReplacement(session, options));
}

/** Fences repeated recovery ticks while one replacement browser launch is in flight. */
async function requested(config, sessionId, requestId = "") {
	const session = await Store.load(config, sessionId);
	if (!session) return null;
	session.replacementRequestedAt = new Date().toISOString();
	session.replacementRequestId = requestId;
	return Store.save(config, session);
}

/** Marks the old chat recovered only after the new replacement session actually connects. */
async function recovered(config, sessionId, replacementSessionId = "") {
	const session = await Store.load(config, sessionId);
	if (!session) return null;
	session.replacementNeeded = false;
	session.replacedBy = replacementSessionId;
	session.recoveredAt = new Date().toISOString();
	session.replacementRequestedAt = "";
	return Store.save(config, session);
}

/** Returns operator-safe session truth for Tunnel Control and recovery decisions. */
async function status(config, options = {}) {
	const sessions = await Store.all(config);
	return {
		count: sessions.length,
		active: sessions.filter(session => ACTIVE.has(String(session.status || ""))).length,
		replacementNeeded: sessions.filter(session => needsReplacement(session, options)).length,
		sessions: sessions.map(session => ({
			id: session.id,
			logicalAgentId: session.logicalAgentId,
			role: session.role,
			status: session.status,
			activeMissionId: session.activeMissionId,
			lastSeenAt: session.lastSeenAt,
			replacementNeeded: needsReplacement(session, options),
			replacementRequestedAt: session.replacementRequestedAt || ""
		}))
	};
}

module.exports = {
	ACTIVE,
	DEFAULT_REQUEST_COOLDOWN_MS,
	DEFAULT_STALE_MS,
	candidates,
	needsReplacement,
	recovered,
	requested,
	status
};
