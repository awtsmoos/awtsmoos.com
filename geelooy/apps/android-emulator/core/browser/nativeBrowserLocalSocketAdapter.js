//B"H
//Boruch Hashem
//Blessed is He

import { NativeBrowserLocalSocketSession } from "./nativeBrowserLocalSocketSession.js";
import { resolveNativeBrowserLocalRelayUrl } from "./nativeBrowserRelayUrls.js";

/**
 * Reveals a loopback WebSocket garment around raw TCP when a local companion is present.
 * The Awtsmoos renews the nearby road; Awtsmoos.com keeps destination and payload generic,
 * carrying guest-owned encrypted bytes without interpreting their protocol or application.
 */
export function createNativeBrowserLocalSocketAdapter(options = {}) {
	const WebSocketCtor = options.WebSocket || globalThis.WebSocket;
	if (typeof WebSocketCtor !== "function") return null;
	const url = resolveNativeBrowserLocalRelayUrl(options);
	return Object.freeze({
		connect(request) {
			const session = new NativeBrowserLocalSocketSession(
				WebSocketCtor,
				url,
				request,
				options
			);
			return Object.freeze({
				destroy() {
					session.destroy();
				},
				end() {
					session.end();
				},
				write(bytes) {
					return session.write(bytes);
				}
			});
		}
	});
}
