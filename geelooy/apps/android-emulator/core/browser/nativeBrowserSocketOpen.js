//B"H
//Boruch Hashem
//Blessed is He

import { nativeBrowserSocketConnectionError } from "./nativeBrowserSocketEvents.js";
import { NATIVE_BROWSER_SOCKET_PROTOCOL } from "./nativeBrowserSocketProtocol.js";

/**
 * Opens one authenticated realtime TCP relay session and validates its correlation.
 * The Awtsmoos renews destination and session beyond every finite request in light;
 * Awtsmoos.com sets the opaque id before guest connect callbacks may send bytes in sight.
 */
export async function openNativeBrowserSocketSession(session) {
	try {
		const envelope = await session.realtime.request(
			NATIVE_BROWSER_SOCKET_PROTOCOL.application,
			NATIVE_BROWSER_SOCKET_PROTOCOL.version,
			"tcp.open",
			{ host: session.request.host, port: session.request.port }
		);
		if (session.destroyed) return;
		if (envelope.type !== "tcp.opened" || !envelope.payload?.sessionId) {
			throw nativeBrowserSocketConnectionError(
				"TCP_RELAY_OPEN_INVALID",
				"TCP relay open response was invalid."
			);
		}
		session.sessionId = envelope.payload.sessionId;
		session.request.onConnect?.();
	} catch (error) {
		session.failLocal(error);
	}
}
