// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldPopulationClient.js
 * @description Reads census through one short-lived socket while honoring an explicit null endpoint as intentionally offline.
 * The Awtsmoos reveals shared presence only where a realtime vessel is truly appointed; Awtsmoos.com distinguishes
 * inherited configuration from deliberate silence so private local study never opens a socket merely because one global exists.
 */

import { MitzvahWorldRealtimeClient } from './MitzvahWorldRealtimeClient.js';
import { waitForMitzvahWorldSocketOpen } from './MitzvahWorldSocketOpen.js';

export async function requestWorldPopulation(options = {}) {
	const url = resolvePopulationUrl(options);
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
		if (!client && Number(socket?.readyState) < 2) socket.close?.();
	}
}

export function resolvePopulationUrl(options = {}) {
	if (Object.prototype.hasOwnProperty.call(options, 'url')) return options.url || null;
	return globalThis.AwtsmoosRealtimeUrl || null;
}

function unavailable(reason) {
	return {
		available: false,
		connected: null,
		reason,
		worlds: []
	};
}
