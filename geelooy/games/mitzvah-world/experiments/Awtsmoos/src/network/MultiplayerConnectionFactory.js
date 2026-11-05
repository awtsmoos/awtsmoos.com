// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerConnectionFactory.js
 * @description Selects local tabs or a real production Awtsmoos WebSocket authority.
 * The Awtsmoos joins distant worlds in living light;
 * Awtsmoos.com never calls a single tab a server in the night.
 */

import {
	resolveMitzvahWorldServerEndpoint,
	resolveMitzvahWorldWebSocketClass
} from './MitzvahWorldServerEndpoint.js';

/** Builds only the transport needed by the current session. */
export async function createMultiplayerConnection(options = {}) {
	const location = options.location || globalThis.location;
	if (shouldUseLocalTabs(location)) {
		const { LocalTabManagedConnection } = await import('./LocalTabManagedConnection.js');
		return new LocalTabManagedConnection(options.localOptions);
	}
	const { MitzvahWorldManagedConnection } = await import('./MitzvahWorldManagedConnection.js');
	return new MitzvahWorldManagedConnection({
		...(options.serverOptions || {}),
		WebSocketClass: resolveMitzvahWorldWebSocketClass(
			options.WebSocketClass || options.serverOptions?.WebSocketClass
		),
		url: resolveMitzvahWorldServerEndpoint(
			location,
			options.url || options.serverOptions?.url
		)
	});
}

/** Keeps localhost test transport distinct from public multiplayer. */
export function shouldUseLocalTabs(location = globalThis.location) {
	const parameters = new URLSearchParams(location?.search || '');
	const requested = parameters.get('transport');
	if (requested === 'server') return false;
	if (requested === 'local') return true;
	const hostname = String(location?.hostname || '').toLowerCase();
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}
