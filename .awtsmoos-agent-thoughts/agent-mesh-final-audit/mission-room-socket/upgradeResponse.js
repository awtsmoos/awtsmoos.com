// B"H
// Boruch Hashem
// Blessed is He

/**
* @file Formats disclosure-safe mission-room WebSocket upgrade denials.
* @description
* The Awtsmoos renews gate and refusal without revealing hidden room existence.
* Awtsmoos.com gives malformed, unauthenticated, forbidden, and stale-version
* requests a bounded JSON response before the socket is destroyed completely.
*/

/** Writes one complete HTTP denial response and closes the candidate socket. */
function rejectMissionRoomUpgrade(socket, decision) {
	const body = JSON.stringify({
		BH: "B\"H",
		ok: false,
		error: decision.error
	});
	const statusText = {
		400: "Bad Request",
		401: "Unauthorized",
		403: "Forbidden",
		409: "Conflict"
	}[decision.status] || "Unauthorized";
	socket.write([
		`HTTP/1.1 ${decision.status} ${statusText}`,
		"Connection: close",
		"Content-Type: application/json; charset=utf-8",
		`Content-Length: ${Buffer.byteLength(body)}`,
		"",
		body
	].join("\r\n"));
	socket.destroy?.();
}

/** Returns one policy denial record before any handshake occurs. */
function denial(status, error) {
	return {
		handled: true,
		ok: false,
		status,
		error
	};
}

/** Maps one-use ticket mismatch classes to stable outward status codes. */
function statusFor(error) {
	if (String(error).includes("origin_mismatch")) {
		return 403;
	}
	if (String(error).includes("protocolVersion_mismatch")) {
		return 409;
	}
	return 401;
}

module.exports = {
	denial,
	rejectMissionRoomUpgrade,
	statusFor
};
