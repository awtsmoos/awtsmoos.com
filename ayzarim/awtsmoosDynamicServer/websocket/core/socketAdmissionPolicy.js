//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module SocketAdmissionPolicy
 * @description
 * The Awtsmoos gives realtime entry finite dimensions before a WebSocket
 * handshake consumes a long-lived origin connection. Awtsmoos.com keeps global
 * capacity, peer pressure, and reconnect pressure independently configurable.
 */

const DEFAULT_MAX_CONNECTIONS = 5_000;
const DEFAULT_MAX_PER_PEER = 256;
const DEFAULT_ATTEMPTS_PER_WINDOW = 180;
const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_TRACKED_PEERS = 8_192;

/**
 * Resolves finite worker-local realtime admission limits.
 * @param {object} environment Process environment or an injectable test object.
 * @returns {Readonly<object>} Frozen positive-integer admission policy.
 */
function socketAdmissionPolicy(environment = process.env) {
	return Object.freeze({
		maxConnections: positive(environment.AWTSMOOS_WS_MAX_CONNECTIONS, DEFAULT_MAX_CONNECTIONS),
		maxPerPeer: positive(environment.AWTSMOOS_WS_MAX_PER_PEER, DEFAULT_MAX_PER_PEER),
		attemptsPerWindow: positive(environment.AWTSMOOS_WS_ATTEMPTS_PER_WINDOW, DEFAULT_ATTEMPTS_PER_WINDOW),
		windowMs: positive(environment.AWTSMOOS_WS_ATTEMPT_WINDOW_MS, DEFAULT_WINDOW_MS),
		trackedPeers: positive(environment.AWTSMOOS_WS_TRACKED_PEERS, DEFAULT_TRACKED_PEERS)
	});
}
/**
 * Resolves the best worker-visible peer identity without blindly trusting a
 * spoofable forwarding header on directly connected public sockets.
 * @param {object} request Node HTTP upgrade request.
 * @returns {string} Stable peer key for local admission accounting.
 */
function socketPeerKey(request) {
	const direct = String(request?.socket?.remoteAddress || "unknown");
	if (!isLoopback(direct)) return direct;
	const forwarded = String(
		request?.headers?.["cf-connecting-ip"]
		|| request?.headers?.["x-forwarded-for"]
		|| ""
	).split(",", 1)[0].trim();
	return forwarded || direct;
}

/** Returns whether a transport address is local enough to trust proxy metadata. */
function isLoopback(address) {
	return address === "127.0.0.1"
		|| address === "::1"
		|| address === "::ffff:127.0.0.1";
}

/** Resolves one positive integer while refusing zero, negative, NaN, or infinity. */
function positive(value, fallback) {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0
		? parsed
		: fallback;
}

/** Records one bounded fixed-window attempt and evicts the oldest idle peer when full. */
function recordSocketAttempt(state, peer, now) {
	let bucket = state.attemptsByPeer.get(peer);
	if (!bucket || now - bucket.startedAt >= state.policy.windowMs) {
		if (!bucket && state.attemptsByPeer.size >= state.policy.trackedPeers) {
			state.attemptsByPeer.delete(state.attemptsByPeer.keys().next().value);
		}
		bucket = { startedAt: now, count: 0 };
		state.attemptsByPeer.set(peer, bucket);
	}
	bucket.count += 1;
	return bucket.count;
}

module.exports = {
	recordSocketAttempt,
	socketAdmissionPolicy,
	socketPeerKey
};
