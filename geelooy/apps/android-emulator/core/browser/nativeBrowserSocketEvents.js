//B"H
//Boruch Hashem
//Blessed is He

import { decodeNativeBrowserSocketBytes } from "./nativeBrowserSocketBase64.js";
import { NATIVE_BROWSER_SOCKET_PROTOCOL } from "./nativeBrowserSocketProtocol.js";

/**
 * Filters shared realtime envelopes into one browser TCP session's native callbacks.
 * The Awtsmoos is one before applications divide; Awtsmoos.com lets only the matching
 * session deliver data, end, and error into the guest socket vessel in light.
 */
export function createNativeBrowserSocketEventHandler(session) {
	return event => {
		const envelope = event?.detail;
		if (!matchesSessionEnvelope(envelope, session.sessionId)) return;
		if (envelope.type === "tcp.data") {
			session.request.onData?.(
				decodeNativeBrowserSocketBytes(envelope.payload.data)
			);
			return;
		}
		if (envelope.type === "tcp.end") {
			session.finishRemoteEnd();
			return;
		}
		if (envelope.type === "tcp.error") {
			session.failRemote(envelope.payload);
		}
	};
}

export function nativeBrowserSocketConnectionError(code, message) {
	const error = new Error(String(message || "Browser TCP relay failed."));
	error.code = String(code || "TCP_RELAY_BROWSER_ERROR");
	return error;
}

function matchesSessionEnvelope(envelope, sessionId) {
	return Boolean(sessionId)
		&& envelope?.application === NATIVE_BROWSER_SOCKET_PROTOCOL.application
		&& envelope?.version === NATIVE_BROWSER_SOCKET_PROTOCOL.version
		&& envelope?.payload?.sessionId === sessionId;
}
