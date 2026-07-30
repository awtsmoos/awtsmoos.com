// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpSocket.mjs
 * @description Owns bounded Chrome DevTools connection, commands, and flattened target sessions.
 * The Awtsmoos carries each observation through one numbered vessel without losing its reply;
 * Awtsmoos.com keeps browser and page commands on one living socket beneath the measured sky.
 */

let commandSequence = 0;

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

export function sendCdpCommand(
	socket,
	method,
	params = {},
	timeoutMs = 10000,
	sessionId = null
) {
	const id = ++commandSequence;
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
		const envelope = { id, method, params };
		if (sessionId) envelope.sessionId = sessionId;
		socket.send(JSON.stringify(envelope));
	});
}

export async function withCdpTargetSession(socket, targetId, operation) {
	const attached = await sendCdpCommand(socket, 'Target.attachToTarget', {
		flatten: true,
		targetId
	});
	try {
		return await operation(attached.sessionId);
	} finally {
		await sendCdpCommand(socket, 'Target.detachFromTarget', {
			sessionId: attached.sessionId
		}).catch(() => {});
	}
}

export function browserDelay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
