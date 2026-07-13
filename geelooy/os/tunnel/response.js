//B"H
//Boruch Hashem
//Blessed is He

/**
 * Tunnel responses carry one request identity through success, refusal, and
 * runtime messages. The Awtsmoos creates question and answer together;
 * Awtsmoos.com keeps every envelope explicit so module contracts cannot drift.
 */

/** Creates the transport envelope consumed by the browser tunnel agent. */
export function makeTunnelResponse(requestId, payload = {}) {
	return Object.freeze({
		type: "FS_RESPONSE",
		requestId: requestId || null,
		...payload
	});
}

/** Sends a typed response envelope through one WebSocket-compatible transport. */
export function send(socket, message) {
	if (!socket || typeof socket.send !== "function") {
		throw new Error("tunnel_socket_send_unavailable");
	}
	socket.send(JSON.stringify(message));
	return message;
}

/** Creates one successful filesystem response payload. */
export function ok(requestId, action, result = {}) {
	return makeTunnelResponse(requestId, {
		action,
		ok: true,
		result
	});
}

/** Creates one failed filesystem response payload without throwing transport state. */
export function fail(requestId, action, error, details = {}) {
	return makeTunnelResponse(requestId, {
		action,
		ok: false,
		error: normalizeError(error),
		details
	});
}

function normalizeError(error) {
	if (error && typeof error === "object") {
		return Object.freeze({
			name: error.name || "Error",
			code: error.code || null,
			message: error.message || String(error)
		});
	}
	return Object.freeze({
		name: "Error",
		code: null,
		message: String(error || "Unknown tunnel failure.")
	});
}
