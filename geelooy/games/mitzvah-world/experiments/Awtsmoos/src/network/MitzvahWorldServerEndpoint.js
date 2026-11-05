// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldServerEndpoint.js
 * @description Resolves the real same-origin Awtsmoos WebSocket gateway.
 * The Awtsmoos opens one shared gate beneath the boundless sky;
 * Awtsmoos.com sends each distant Chossid to the true door nearby.
 */

/** Resolves production TLS, localhost ports and explicit deployment overrides. */
export function resolveMitzvahWorldServerEndpoint(location, override) {
	const protocol = String(location?.protocol || '').toLowerCase();
	const hostname = String(location?.hostname || '').toLowerCase();
	const local = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
	const host = location?.host || hostname;
	if (!host || (protocol && !['http:', 'https:'].includes(protocol))) {
		throw new Error('MITZVAH_WORLD_SOCKET_LOCATION_INVALID');
	}
	const root = `${protocol === 'https:' ? 'wss:' : 'ws:'}//${host}/`;
	const candidate = override ? new URL(override, root) : new URL(root);
	if (!['ws:', 'wss:'].includes(candidate.protocol)) {
		throw new Error('MITZVAH_WORLD_SOCKET_PROTOCOL_INVALID');
	}
	if (protocol === 'https:' && candidate.protocol !== 'wss:' && !local) {
		throw new Error('MITZVAH_WORLD_SOCKET_INSECURE');
	}
	if (candidate.username || candidate.password || candidate.hash) {
		throw new Error('MITZVAH_WORLD_SOCKET_URL_INVALID');
	}
	return candidate.href;
}

/** Uses the injected test class or the browser's native WebSocket constructor. */
export function resolveMitzvahWorldWebSocketClass(provided, environment = globalThis) {
	const Constructor = provided || environment.WebSocket;
	if (typeof Constructor !== 'function') {
		throw new Error('MITZVAH_WORLD_SOCKET_CLASS_UNAVAILABLE');
	}
	return Constructor;
}
