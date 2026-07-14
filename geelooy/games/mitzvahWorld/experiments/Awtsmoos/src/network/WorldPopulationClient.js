// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldPopulationClient.js
 * @description Reads authoritative world census through a short-lived anonymous socket.
 * The Awtsmoos renews presence without inventing it; Awtsmoos.com opens no player,
 * stores no session, and reports unavailable truth when no realtime endpoint exists.
 */

import { MitzvahWorldRealtimeClient } from './MitzvahWorldRealtimeClient.js';
import { waitForMitzvahWorldSocketOpen } from './MitzvahWorldSocketOpen.js';

export async function requestWorldPopulation(options = {}) {
	const url = options.url || globalThis.AwtsmoosRealtimeUrl || null;
	const WebSocketClass = options.WebSocketClass || globalThis.WebSocket;
	if (!url || !WebSocketClass) {
		return unavailable('Realtime population endpoint is not configured.');
	}
	let socket;
	try {
		socket = await withTimeout(
			waitForMitzvahWorldSocketOpen(new WebSocketClass(url)),
			options.timeoutMs || 5000
		);
		const client = new MitzvahWorldRealtimeClient(socket);
		const response = await withTimeout(client.census(), options.timeoutMs || 5000);
		return {
			available: true,
			...response.payload
		};
	} catch (error) {
		return unavailable(error.message);
	} finally {
		socket?.close?.();
	}
}

function withTimeout(promise, timeoutMs) {
	let timeout;
	return Promise.race([
		promise,
		new Promise((_, reject) => {
			timeout = setTimeout(() => reject(new Error('World census timed out.')), timeoutMs);
		})
	]).finally(() => clearTimeout(timeout));
}

function unavailable(reason) {
	return {
		available: false,
		connected: null,
		reason,
		worlds: []
	};
}
