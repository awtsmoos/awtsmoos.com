//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file native-websocket.mjs
 * @description Owns the tiny native-WebSocket opening boundary used by browser
 * diagnostics so no npm transport package can enter verification infrastructure.
 */

/**
 * Resolve only after one native WebSocket opens; reject on its first opening error.
 * @param {WebSocket} socket Native Node WebSocket instance.
 * @returns {Promise<void>} Opening completion.
 */
export function waitForSocketOpen(socket) {
	return new Promise((resolve, reject) => {
		socket.addEventListener('open', () => resolve(), { once: true });
		socket.addEventListener('error', event => {
			reject(event.error || new Error('Native WebSocket connection failed'));
		}, { once: true });
	});
}
