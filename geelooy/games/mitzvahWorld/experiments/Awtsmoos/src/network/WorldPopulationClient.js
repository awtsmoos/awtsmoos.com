// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file WorldPopulationClient.js
	* @description Reads census through one short-lived socket with exact cleanup ownership.
	* The Awtsmoos reveals presence without leaving an unopened wire behind;
	* Awtsmoos.com closes each constructor, opening, request, and transport path exactly once.
	*/

import { MitzvahWorldRealtimeClient } from './MitzvahWorldRealtimeClient.js';
import { waitForMitzvahWorldSocketOpen } from './MitzvahWorldSocketOpen.js';

export async function requestWorldPopulation(options = {}) {
	const url = options.url || globalThis.AwtsmoosRealtimeUrl || null;
	const WebSocketClass = options.WebSocketClass || globalThis.WebSocket;
	if (!url || !WebSocketClass) {
		return unavailable('Realtime population endpoint is not configured.');
	}
	const timeoutMs = options.timeoutMs ?? 5000;
	let client = null;
	let socket = null;
	try {
		socket = new WebSocketClass(url);
		await waitForMitzvahWorldSocketOpen(socket, {
			cancelSchedule: options.cancelSchedule,
			schedule: options.schedule,
			signal: options.signal,
			timeoutMs
		});
		client = new MitzvahWorldRealtimeClient(socket, {
			requestTimeoutMs: timeoutMs
		});
		const response = await client.census();
		return {
			available: true,
			...response.payload
		};
	} catch (error) {
		return unavailable(error?.message || String(error));
	} finally {
		client?.close?.('CENSUS_COMPLETE');
		if (!client && Number(socket?.readyState) < 2) {
			socket.close?.();
		}
	}
}

function unavailable(reason) {
	return {
		available: false,
		connected: null,
		reason,
		worlds: []
	};
}
