//B"H
//Boruch Hashem
//Blessed be He

"use strict";

const {
	recordSocketAttempt,
	socketAdmissionPolicy,
	socketPeerKey
} = require("./socketAdmissionPolicy.js");

/**
 * @module SocketAdmission
 * @description
 * The Awtsmoos refuses excess realtime pressure before the WebSocket handshake.
 * Awtsmoos.com bounds worker connections, peer concentration, reconnect storms,
 * and admission memory while exposing only tiny local operational counters.
 */

/**
 * Attempts one WebSocket admission and writes a complete denial when refused.
 * @param {object} server Awtsmoos realtime server.
 * @param {object} request HTTP upgrade request.
 * @param {object} socket Raw TCP socket.
 * @param {number} now Millisecond clock witness for deterministic tests.
 * @returns {object|null} Admission ticket on success, otherwise null.
 */
function admitSocket(server, request, socket, now = Date.now()) {
	const state = ensureAdmissionState(server);
	const peer = socketPeerKey(request);
	const pressure = recordSocketAttempt(state, peer, now);
	if (server.isDraining) {
		return deny(state, socket, 503, "draining");
	}
	if (pressure > state.policy.attemptsPerWindow) {
		return deny(state, socket, 429, "reconnect_rate");
	}
	if (state.active >= state.policy.maxConnections) {
		return deny(state, socket, 503, "worker_capacity");
	}
	const peerActive = state.activeByPeer.get(peer) || 0;
	if (peerActive >= state.policy.maxPerPeer) {
		return deny(state, socket, 429, "peer_capacity");
	}
	state.active += 1;
	state.accepted += 1;
	state.peak = Math.max(state.peak, state.active);
	state.activeByPeer.set(peer, peerActive + 1);
	return {
		peer,
		released: false
	};
}

/** Releases one accepted ticket exactly once when its client leaves the server. */
function releaseSocketAdmission(server, ticket) {
	if (!ticket || ticket.released) return false;
	const state = ensureAdmissionState(server);
	ticket.released = true;
	state.active = Math.max(0, state.active - 1);
	const peerActive = state.activeByPeer.get(ticket.peer) || 0;
	if (peerActive <= 1) state.activeByPeer.delete(ticket.peer);
	else state.activeByPeer.set(ticket.peer, peerActive - 1);
	return true;
}

/** Returns frozen worker-local counters without exposing peer identities. */
function socketAdmissionSnapshot(server) {
	const state = ensureAdmissionState(server);
	return Object.freeze({
		active: state.active,
		accepted: state.accepted,
		rejected: state.rejected,
		peak: state.peak,
		trackedPeers: state.activeByPeer.size,
		maxConnections: state.policy.maxConnections
	});
}

/** Creates bounded admission state lazily so the socket class stays focused. */
function ensureAdmissionState(server) {
	if (server.__awtsmoosSocketAdmission) return server.__awtsmoosSocketAdmission;
	server.__awtsmoosSocketAdmission = {
		policy: socketAdmissionPolicy(server.socketAdmissionEnvironment || process.env),
		active: 0,
		accepted: 0,
		rejected: 0,
		peak: 0,
		activeByPeer: new Map(),
		attemptsByPeer: new Map()
	};
	return server.__awtsmoosSocketAdmission;
}


/** Writes a tiny standards-readable pre-handshake denial and closes the TCP vessel. */
function deny(state, socket, status, reason) {
	state.rejected += 1;
	const phrase = status === 429 ? "Too Many Requests" : "Service Unavailable";
	try {
		socket.end(`HTTP/1.1 ${status} ${phrase}\r\nConnection: close\r\nRetry-After: 1\r\nContent-Length: 0\r\nX-Awtsmoos-WS-Reject: ${reason}\r\n\r\n`);
	} catch {
		socket.destroy?.();
	}
	return null;
}

module.exports = {
	admitSocket,
	releaseSocketAdmission,
	socketAdmissionSnapshot
};
