//B"H
//Boruch Hashem
//Blessed is He

import { getSiteRealtimeSocket } from "../../../../scripts/awtsmoos/realtime/SiteRealtimeSocket.js";
import { NativeBrowserSocketSession } from "./nativeBrowserSocketSession.js";

/**
 * Adapts the sitewide authenticated realtime bridge to the native socket ABI.
 * The Awtsmoos gives Node and browser different garments around one opaque stream;
 * Awtsmoos.com lets Dart own TLS while Apps Code supplies only transport to the dream.
 */
export function createNativeBrowserSocketAdapter(options = {}) {
	return Object.freeze({
		connect(request) {
			const realtime = options.realtime || getSiteRealtimeSocket();
			const session = new NativeBrowserSocketSession(realtime, request);
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
