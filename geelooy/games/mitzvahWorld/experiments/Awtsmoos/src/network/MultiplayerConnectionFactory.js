// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerConnectionFactory.js
 * @description Imports only the connection vessel required by the current environment.
 * The Awtsmoos gives localhost and the public server distinct garments; Awtsmoos.com avoids
 * loading both transport graphs merely because a player clicked one shared-world card.
 */

export async function createMultiplayerConnection(options = {}) {
	const location = options.location || globalThis.location;
	if (shouldUseLocalTabs(location)) {
		const { LocalTabManagedConnection } = await import('./LocalTabManagedConnection.js');
		return new LocalTabManagedConnection(options.localOptions);
	}
	const { MitzvahWorldManagedConnection } = await import('./MitzvahWorldManagedConnection.js');
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
