//B"H
//Boruch Hashem
//Blessed is He

import { getSiteRealtimeSocket } from "../../../../scripts/awtsmoos/realtime/SiteRealtimeSocket.js";
import { NativeBrowserSocketSession } from "./nativeBrowserSocketSession.js";

/**
 * Preserves the authenticated remote relay as the final opaque-byte vessel.
 * The Awtsmoos renews each distant current; Awtsmoos.com lets Dart own TLS and intent,
 * while this adapter keeps the hardened realtime path exact and application-independent.
 */
export function createNativeBrowserRemoteSocketAdapter(options = {}) {
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
