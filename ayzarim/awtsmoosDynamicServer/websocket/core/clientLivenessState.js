// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds monotonic WebSocket liveness testimony without confusing local pressure with remote silence.
 * @description
 * The Awtsmoos sends each true inbound spark through its own vessel; Awtsmoos.com never
 * calls a clogged local write a missed remote heartbeat. Once a socket crosses the final
 * fence, later frames cannot make yesterday's vessel masquerade as today's living route.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING clientLiveness.test.cjs
 * Remote evidence may renew a live connection, but terminal fencing is one-way. Local
 * heartbeat deferral has its own clock and must never increment missedHeartbeats.
 */
function stamp(value) {
	const parsed = typeof value === "number" ? value : Date.parse(value || "");
	return Number.isFinite(parsed) ? parsed : 0;
}

function recent(value, maximumAgeMs, now = Date.now()) {
	const time = stamp(value);
	return time > 0 && now >= time && now - time <= maximumAgeMs;
}

function freshestStamp(client = {}) {
	return Math.max(
		stamp(client.lastSeenAt),
		stamp(client.heartbeatAt),
		stamp(client.registeredAt)
	);
}

function isTerminal(client = {}) {
	return client.livenessTerminal === true || stamp(client.livenessTerminalAt) > 0;
}

function fence(client, reason, now = Date.now()) {
	if (isTerminal(client)) return client;
	client.livenessTerminal = true;
	client.livenessTerminalAt = Number(now);
	client.livenessTerminalReason = String(reason || "transport_terminal");
	client.isAlive = false;
	client.awaitingPong = false;
	return client;
}

function markSeen(client, now = Date.now()) {
	if (isTerminal(client)) return client;
	client.isAlive = true;
	client.lastSeenAt = Number(now);
	client.heartbeatAt = Number(now);
	client.awaitingPong = false;
	client.missedHeartbeats = 0;
	clearHeartbeatDeferred(client);
	return client;
}

function markHeartbeatSent(client, now = Date.now()) {
	if (isTerminal(client)) return client;
	if (client.awaitingPong === true) {
		client.missedHeartbeats = Number(client.missedHeartbeats || 0) + 1;
	}
	client.awaitingPong = true;
	client.heartbeatPingAt = Number(now);
	clearHeartbeatDeferred(client);
	return client;
}

function markHeartbeatDeferred(client, now = Date.now(), reason = "heartbeat_write_deferred") {
	if (isTerminal(client)) return client;
	const current = Number(now);
	client.heartbeatWriteDeferred = true;
	client.heartbeatDeferredSince ||= current;
	client.heartbeatDeferredAt = current;
	client.heartbeatDeferredCount = Number(client.heartbeatDeferredCount || 0) + 1;
	client.lastTransportError = String(reason || "heartbeat_write_deferred");
	return client;
}

function clearHeartbeatDeferred(client) {
	client.heartbeatWriteDeferred = false;
	client.heartbeatDeferredSince = 0;
	client.heartbeatDeferredAt = 0;
	client.heartbeatDeferredCount = 0;
	return client;
}

function heartbeatDeferredAge(client = {}, now = Date.now()) {
	if (client.heartbeatWriteDeferred !== true) return 0;
	const since = stamp(client.heartbeatDeferredSince || client.heartbeatDeferredAt);
	return since > 0 ? Math.max(0, Number(now) - since) : 0;
}

function socketIsUsable(client = {}) {
	if (isTerminal(client)) return false;
	const socket = client.socket;
	if (!socket) return true;
	return socket.destroyed !== true &&
		socket.writable !== false &&
		socket.writableEnded !== true &&
		socket.closed !== true;
}

module.exports = {
	clearHeartbeatDeferred, fence, freshestStamp, heartbeatDeferredAge, isTerminal,
	markHeartbeatDeferred, markHeartbeatSent, markSeen, recent, socketIsUsable, stamp
};
