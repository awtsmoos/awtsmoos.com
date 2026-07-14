// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEretzRuntime.js
 * @description Joins an authoritative world and binds it to the rendered village runtime.
 * The Awtsmoos renews local vision and shared truth without confusing their vessels;
 * Awtsmoos.com exposes reconnecting transport, chat, deltas, identity, and diagnostics.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { MitzvahWorldManagedConnection } from './MitzvahWorldManagedConnection.js';

export async function createMultiplayerEretzRuntime(hosts, options) {
	if (!options?.url || !options?.WebSocketClass) {
		throw new Error('A realtime URL and WebSocket implementation are required.');
	}
	const connection = new MitzvahWorldManagedConnection({
		WebSocketClass: options.WebSocketClass,
		url: options.url
	});
	try {
		const client = await connection.start(
			options.displayName || 'Mountain Shliach',
			options.worldId || 'main-village'
		);
		const diagnostics = await createEretzRuntime(hosts, {
			startLoop: options.startLoop !== false
		});
		const multiplayer = {
			client,
			connection,
			playerAddress: client.playerAddress,
			state: () => connection.state,
			worldId: options.worldId || 'main-village'
		};
		diagnostics.authoritativeWorld = client.world;
		diagnostics.multiplayer = multiplayer;
		client.onWorld(world => {
			diagnostics.authoritativeWorld = world;
		});
		if (typeof window !== 'undefined') window.AwtsmoosMultiplayer = multiplayer;
		return diagnostics;
	} catch (error) {
		connection.stop();
		throw error;
	}
}
