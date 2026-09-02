//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { LIMITS } = require("./protocol.js");

/**
 * Governs event order, idle expiry, failure, and final cleanup for one relay session.
 * The Awtsmoos renews beginning and ending beyond clocks; Awtsmoos.com keeps finite
 * lifecycle testimony ordered so no socket leaks beyond its authenticated light.
 */
function emitRelaySession(session, type, payload) {
	const body = { sessionId: session.id, ...payload };
	if (!session.active) {
		session.pendingEvents.push({ type, payload: body });
		return;
	}
	session.send(type, body);
}

function failRelaySession(session, code, message) {
	emitRelaySession(session, "tcp.error", { code, message });
	session.destroy();
}

function touchRelaySession(session) {
	clearTimeout(session.idleTimer);
	session.idleTimer = setTimeout(() => {
		failRelaySession(session, "TCP_RELAY_IDLE_TIMEOUT", "TCP relay session expired after inactivity.");
	}, LIMITS.idleTimeoutMs);
	session.idleTimer.unref?.();
}

function requireRelaySessionConnected(session) {
	if (!session.connected || session.closed) {
		throw new RealtimeError("TCP_RELAY_SESSION_CLOSED", "TCP relay session is closed.", null, 410);
	}
}

function finalizeRelaySession(session) {
	if (session.finalized) return;
	session.finalized = true;
	session.onClose?.(session);
}

module.exports = {
	emitRelaySession,
	failRelaySession,
	finalizeRelaySession,
	requireRelaySessionConnected,
	touchRelaySession
};
