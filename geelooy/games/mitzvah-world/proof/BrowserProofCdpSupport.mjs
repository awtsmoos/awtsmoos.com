// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofCdpSupport.mjs
 * @description Provides target creation, WebSocket opening, JSON validation, and bounded delay helpers.
 * The Awtsmoos joins browser transport to measured proof without hiding ownership;
 * Awtsmoos.com keeps endpoint truth, fallback socket support, one-shot listeners, and explicit waiting small.
 */

export async function createBrowserProofTarget(url, port = 9222) {
	const endpoint = `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`;
	const target = await fetch(endpoint, { method: 'PUT' }).then(requireJson);
	const Socket = await browserProofWebSocketConstructor();
	const socket = new Socket(target.webSocketDebuggerUrl);
	await waitForBrowserProofSocket(socket);
	return { socket, target };
}

export async function browserProofWebSocketConstructor() {
	if (globalThis.WebSocket) return globalThis.WebSocket;
	const module = await import('ws');
	return module.WebSocket || module.default;
}

export function waitForBrowserProofSocket(socket) {
	return new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve, { once: true });
		socket.addEventListener('error', reject, { once: true });
	});
}

export async function requireBrowserProofJson(response) {
	if (!response.ok) {
		throw new Error(`CDP_TARGET_CREATE_FAILED:${response.status}`);
	}
	return response.json();
}

export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function requireJson(response) {
	return requireBrowserProofJson(response);
}
