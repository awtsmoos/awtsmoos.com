// B"H
// Boruch Hashem
// Blessed is He

const State = require("./clientLivenessState.js");

const DEFAULTS = Object.freeze({
	maxMissedHeartbeats: Number(process.env.AWTSMOOS_WS_MAX_MISSED_HEARTBEATS || 3),
	probeGraceMs: Number(process.env.AWTSMOOS_WS_PROBE_GRACE_MS || 10000),
	staleMs: Number(process.env.AWTSMOOS_WS_STALE_MS || 90 * 1000),
	localBackpressureGraceMs: Number(
		process.env.AWTSMOOS_WS_BACKPRESSURE_GRACE_MS ||
		process.env.AWTSMOOS_WS_STALE_MS ||
		90 * 1000
	)
});

/**
 * @file Decides routability only from monotonic transport evidence and bounded local failure.
 * @description
 * The Awtsmoos does not vanish because a clock grows old; Awtsmoos.com first asks whether
 * a probe truly failed or the local vessel could not even send it. Unprobed silence stays
 * routable, while proven failure crosses a one-way fence that no late frame can reverse.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING clientLiveness.test.cjs
 * Historical symptom: a live tunnel became stale_unproven/offline, then revived on the same
 * socket and generation. Forbidden simplification: route freshness = timestamp age alone.
 */
function evidenceIsFresh(client, now = Date.now(), limits = DEFAULTS) {
	return State.recent(State.freshestStamp(client), limits.staleMs, now);
}

function responseIsFresh(client, now = Date.now(), limits = DEFAULTS) {
	return State.recent(
		Math.max(State.stamp(client.lastSeenAt), State.stamp(client.heartbeatAt)),
		limits.probeGraceMs * 2,
		now
	);
}

function backpressureGraceMs(limits = DEFAULTS) {
	const configured = Number(limits.localBackpressureGraceMs);
	if (Number.isFinite(configured) && configured > 0) return configured;
	return Number(limits.staleMs || DEFAULTS.staleMs);
}

function terminalReason(client, now = Date.now(), limits = DEFAULTS) {
	if (State.isTerminal(client)) return client.livenessTerminalReason || "terminal_fenced";
	if (!State.socketIsUsable(client)) return "socket_unusable";
	const deferredAgeMs = State.heartbeatDeferredAge(client, now);
	if (deferredAgeMs >= backpressureGraceMs(limits) && deferredAgeMs > 0) {
		return "heartbeat_backpressure_expired";
	}
	const missed = Number(client?.missedHeartbeats || 0);
	if (missed >= limits.maxMissedHeartbeats && !responseIsFresh(client, now, limits)) {
		return "heartbeat_probe_expired";
	}
	return "";
}

function shouldTerminate(client, now = Date.now(), limits = DEFAULTS) {
	const reason = terminalReason(client, now, limits);
	if (!reason) return false;
	State.fence(client, reason, now);
	return true;
}

function canRoute(client, now = Date.now(), limits = DEFAULTS) {
	return !shouldTerminate(client, now, limits);
}

function stateFor(client = {}, now = Date.now(), limits = DEFAULTS) {
	if (shouldTerminate(client, now, limits)) return "terminal_fenced";
	if (client.heartbeatWriteDeferred === true) return "heartbeat_backpressure";
	const missed = Number(client.missedHeartbeats || 0);
	if (missed >= limits.maxMissedHeartbeats) return "suspect";
	if (missed > 0) return "degraded";
	if (client.awaitingPong === true) return "probing";
	return evidenceIsFresh(client, now, limits) ? "active" : "stale_probing";
}

function livenessSnapshot(client = {}, now = Date.now(), limits = DEFAULTS) {
	const newestEvidenceAt = State.freshestStamp(client);
	return {
		isAlive: canRoute(client, now, limits),
		rawIsAlive: client.isAlive === false ? false : client.isAlive,
		evidenceFresh: evidenceIsFresh(client, now, limits),
		probing: client.awaitingPong === true && Number(client.missedHeartbeats || 0) === 0,
		lastSeenAt: State.stamp(client.lastSeenAt) || null,
		heartbeatAt: State.stamp(client.heartbeatAt) || null,
		registeredAt: State.stamp(client.registeredAt) || null,
		newestEvidenceAt: newestEvidenceAt || null,
		missedHeartbeats: Number(client.missedHeartbeats || 0),
		heartbeatDeferredMs: State.heartbeatDeferredAge(client, now),
		livenessTerminal: State.isTerminal(client),
		livenessTerminalReason: client.livenessTerminalReason || "",
		livenessState: stateFor(client, now, limits)
	};
}

module.exports = {
	DEFAULTS, canRoute, evidenceIsFresh, livenessSnapshot, responseIsFresh, shouldTerminate,
	stateFor, terminalReason, ...State
};
