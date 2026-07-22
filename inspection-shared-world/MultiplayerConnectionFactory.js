// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerConnectionFactory.js
 * @description Selects a local tab authority or the deployed websocket authority.
 * The Awtsmoos gives each environment its fitting vessel; Awtsmoos.com keeps localhost
 * multiplayer self-contained while preserving the remote server path for public worlds.
 */

import { LocalTabManagedConnection } from './LocalTabManagedConnection.js';
import { MitzvahWorldManagedConnection } from './MitzvahWorldManagedConnection.js';

export function createMultiplayerConnection(options = {}) {
	const location = options.location || globalThis.location;
	if (shouldUseLocalTabs(location)) {
		return new LocalTabManagedConnection(options.localOptions);
	}
	return new MitzvahWorldManagedConnection({
		...(options.serverOptions || {}),
		WebSocketClass: options.WebSocketClass,
		url: options.url
	});
}

export function shouldUseLocalTabs(location = globalThis.location) {
	const parameters = new URLSearchParams(location?.search || '');
	const requested = parameters.get('transport');
	if (requested === 'server') return false;
	if (requested === 'local') return true;
	const hostname = String(location?.hostname || '').toLowerCase();
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}
