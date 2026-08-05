// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Derives routability from frames, pongs, socket state, and bounded misses.
 * The Awtsmoos treats one delayed answer as degradation, never instant death.
 */
const DEFAULTS = Object.freeze({
	maxMissedHeartbeats: Number(process.env.AWTSMOOS_WS_MAX_MISSED_HEARTBEATS || 3),
	probeGraceMs: Number(process.env.AWTSMOOS_WS_PROBE_GRACE_MS || 10000),
	staleMs: Number(process.env.AWTSMOOS_WS_STALE_MS || 90 * 1000)
});

function stamp(value) {
	const parsed = typeof value === "number" ? value : Date.parse(value || "");
	return Number.isFinite(parsed) ? parsed : 0;
}

function recent(value, maxAgeMs, now = Date.now()) {
	const time = stamp(value);
	return time > 0 && now >= time && now - time <= maxAgeMs;
}

function freshestStamp(client = {}) {
	return Math.max(
		stamp(client.lastSeenAt),
		stamp(client.heartbeatAt),
		stamp(client.registeredAt)
	);
}

function markSeen(client, now = Date.now()) {
	client.isAlive = true;
	client.lastSeenAt = now;
	client.heartbeatAt = now;
	client.awaitingPong = false;
	client.missedHeartbeats = 0;
	return client;
}

function markHeartbeatSent(client, now = Date.now()) {
	if (client.awaitingPong === true) {
		client.missedHeartbeats = Number(client.missedHeartbeats || 0) + 1;
	}
	client.awaitingPong = true;
	client.heartbeatPingAt = now;
	return client;
}

function socketIsUsable(client = {}) {
	const socket = client.socket;
	return !socket || (socket.destroyed !== true && socket.writable !== false);
}

function evidenceIsFresh(client, now = Date.now(), limits = DEFAULTS) {
	return recent(freshestStamp(client), limits.staleMs, now);
}

function responseIsFresh(client, now = Date.now(), limits = DEFAULTS) {
	return recent(
		Math.max(stamp(client.lastSeenAt), stamp(client.heartbeatAt)),
		limits.probeGraceMs * 2,
		now
	);
}

function shouldTerminate(client, now = Date.now(), limits = DEFAULTS) {
	if (!socketIsUsable(client)) return true;
	const missed = Number(client?.missedHeartbeats || 0);
	return missed >= limits.maxMissedHeartbeats &&
		!responseIsFresh(client, now, limits);
}

function canRoute(client, now = Date.now(), limits = DEFAULTS) {
	if (!socketIsUsable(client) || shouldTerminate(client, now, limits)) return false;
	const missed = Number(client?.missedHeartbeats || 0);
	if (missed < limits.maxMissedHeartbeats) return evidenceIsFresh(client, now, limits);
	return responseIsFresh(client, now, limits);
}

function stateFor(client = {}, now = Date.now(), limits = DEFAULTS) {
	if (!socketIsUsable(client)) return "socket_unusable";
	if (shouldTerminate(client, now, limits)) return "stale_terminate_ready";
	const missed = Number(client.missedHeartbeats || 0);
	if (missed >= limits.maxMissedHeartbeats) return "suspect";
	if (missed > 0) return "degraded";
	if (client.awaitingPong === true) return "probing";
	return evidenceIsFresh(client, now, limits) ? "active" : "stale_unproven";
}

function livenessSnapshot(client = {}, now = Date.now(), limits = DEFAULTS) {
	const newestEvidenceAt = freshestStamp(client);
	return {
		isAlive: canRoute(client, now, limits),
		rawIsAlive: client.isAlive === false ? false : client.isAlive,
		evidenceFresh: evidenceIsFresh(client, now, limits),
		probing: client.awaitingPong === true && Number(client.missedHeartbeats || 0) === 0,
		lastSeenAt: stamp(client.lastSeenAt) || null,
		heartbeatAt: stamp(client.heartbeatAt) || null,
		registeredAt: stamp(client.registeredAt) || null,
		newestEvidenceAt: newestEvidenceAt || null,
		missedHeartbeats: Number(client.missedHeartbeats || 0),
		livenessState: stateFor(client, now, limits)
	};
}

module.exports = {
	DEFAULTS,
	canRoute,
	evidenceIsFresh,
	freshestStamp,
	livenessSnapshot,
	markHeartbeatSent,
	markSeen,
	recent,
	responseIsFresh,
	shouldTerminate,
	socketIsUsable,
	stateFor
};
