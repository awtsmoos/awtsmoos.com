//B"H
//Boruch Hashem
//Blessed is He

import { createNativeBrowserDirectSocketAdapter } from "./nativeBrowserDirectSocketAdapter.js";
import { createNativeBrowserLocalSocketAdapter } from "./nativeBrowserLocalSocketAdapter.js";
import { createNativeBrowserRemoteSocketAdapter } from "./nativeBrowserRemoteSocketAdapter.js";
import { createNativeBrowserSocketFallbackConnection } from "./nativeBrowserSocketFallbackConnection.js";

/**
 * Orders truthful browser TCP vessels from nearest capability to authenticated remote relay.
 * The Awtsmoos renews all three garments; Awtsmoos.com chooses only what the runtime reveals,
 * and the guest sees one stable socket ABI while every opaque byte remains entirely its own.
 */
export function createNativeBrowserSocketTransportSelector(options = {}) {
	const adapters = [];
	const direct = options.directAdapter || createNativeBrowserDirectSocketAdapter(options);
	if (direct) adapters.push(direct);
	const browserLike = Boolean(options.localAdapter || options.location || globalThis.location);
	if (browserLike && options.disableLocalRelay !== true) {
		const local = options.localAdapter || createNativeBrowserLocalSocketAdapter(options);
		if (local) adapters.push(local);
	}
	adapters.push(options.remoteAdapter || createNativeBrowserRemoteSocketAdapter(options));
	return Object.freeze({
		connect(request) {
			return createNativeBrowserSocketFallbackConnection(adapters, request);
		}
	});
}
