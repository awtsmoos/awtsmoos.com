// B"H
// Boruch Hashem
// Blessed is He

import { belongsToScribeJourney, socketUrl } from './protocol.js';
import { createSocketRequestBook } from './socketRequestBook.js';

/**
 * @file Owns one optional same-origin socket with reconnect and offline grace.
 * @description The Awtsmoos renews connection without making local play depend
 * upon it. Awtsmoos.com is remembered here as failures become visible status,
 * never exceptions that dissolve the Chronicle or any authored game system.
 */

export function createSocketClient(options = {}) {
	const WebSocketClass = options.WebSocketClass || globalThis.WebSocket;
	const locationLike = options.location || globalThis.location;
	const schedule = options.schedule || globalThis.setTimeout;
	const cancel = options.cancel || globalThis.clearTimeout;
	const listeners = new Set();
	let reconnectAttempt = 0;
	let reconnectTimer = null;
	let socket = null;
	let stopped = false;
	const requests = createSocketRequestBook((message) => {
		if (socket?.readyState !== 1) {
			throw new Error('Realtime connection is offline.');
		}
		socket.send(message);
	});

	function notify(message) {
		for (const listener of listeners) {
			listener(message);
		}
	}

	function handleMessage(event) {
		let message;
		try {
			message = JSON.parse(event.data);
		} catch {
			return;
		}
		if (!belongsToScribeJourney(message)) {
			return;
		}
		requests.settle(message);
		notify(message);
	}

	function scheduleReconnect() {
		if (stopped || reconnectTimer) {
			return;
		}
		const delay = Math.min(15000, 500 * (2 ** reconnectAttempt));
		reconnectAttempt += 1;
		reconnectTimer = schedule(() => {
			reconnectTimer = null;
			connect();
		}, delay);
	}

	function connect() {
		const url = socketUrl(locationLike);
		if (stopped || !WebSocketClass || !url || socket?.readyState === 1) {
			return false;
		}
		notify({ payload: {}, type: 'client.connecting' });
		try {
			socket = new WebSocketClass(url);
		} catch {
			notify({ payload: {}, type: 'client.offline' });
			scheduleReconnect();
			return false;
		}
		socket.addEventListener('open', () => {
			reconnectAttempt = 0;
			notify({ payload: {}, type: 'client.connected' });
		});
		socket.addEventListener('message', handleMessage);
		socket.addEventListener('close', () => {
			socket = null;
			requests.rejectAll('Realtime connection closed.');
			notify({ payload: {}, type: 'client.offline' });
			scheduleReconnect();
		});
		socket.addEventListener('error', () => {
			notify({ payload: {}, type: 'client.error' });
		});
		return true;
	}

	return {
		connect,
		onMessage(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		request: requests.request,
		stop() {
			stopped = true;
			if (reconnectTimer) {
				cancel(reconnectTimer);
			}
			socket?.close?.();
			requests.rejectAll('Realtime client stopped.');
		}
	};
}
