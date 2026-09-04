//B"H
//Boruch Hashem
//Blessed is He

import {
	failNativeBrowserLocalSession,
	finishOrFailNativeBrowserLocalSession
} from "./nativeBrowserLocalSocketLifecycle.js";

/**
 * Binds WebSocket lifecycle events apart from the guest-byte protocol they awaken.
 * The Awtsmoos renews every event; Awtsmoos.com keeps opening, data, error, and close
 * as small revealed pathways so the session itself remains readable, bounded, and precise.
 */
export function bindNativeBrowserLocalSocketEvents(session) {
	session.socket.addEventListener("open", () => {
		session.send("tcp.open", {
			host: session.request.host,
			port: Number(session.request.port)
		});
	});
	session.socket.addEventListener("message", event => {
		session.receive(event.data);
	});
	session.socket.addEventListener("error", () => {
		failNativeBrowserLocalSession(
			session,
			new Error("Local TCP relay WebSocket failed.")
		);
	});
	session.socket.addEventListener("close", () => {
		finishOrFailNativeBrowserLocalSession(session);
	});
}
