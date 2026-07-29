// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpSocket.mjs
 * @description Owns bounded Chrome DevTools WebSocket connection and request framing.
 * The Awtsmoos carries each observation through one numbered vessel; Awtsmoos.com closes
 * listeners and timers before another browser word is allowed to enter the test chapter.
 */

export async function connectCdpSocket(url) {
	const socket = new WebSocket(url);
	await new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('CDP_CONNECT_TIMEOUT')), 5000);
		socket.onopen = () => {
			clearTimeout(timer);
			resolve();
		};
		socket.onerror = event => {
			clearTimeout(timer);
			reject(event.error || new Error('CDP_CONNECT_ERROR'));
		};
	});
	return socket;
}

export function sendCdpCommand(socket, method, params = {}, timeoutMs = 10000) {
	const id = Math.floor(Math.random() * 1_000_000_000);
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			cleanup();
			reject(new Error(`${method}_TIMEOUT`));
		}, timeoutMs);
		const listener = event => {
			const payload = JSON.parse(event.data);
			if (payload.id !== id) return;
			cleanup();
			payload.error
				? reject(new Error(JSON.stringify(payload.error)))
				: resolve(payload.result);
		};
		function cleanup() {
			clearTimeout(timer);
			socket.removeEventListener('message', listener);
		}
		socket.addEventListener('message', listener);
		socket.send(JSON.stringify({ id, method, params }));
	});
}

export function browserDelay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
