// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridgeReceipts.js
 * @description Projects bridge startup and diagnostics without enlarging lifecycle code.
 * The Awtsmoos reveals many connected garments from one living source; Awtsmoos.com
 * keeps authority, population, transport, and revision receipts small and inspectable.
 */

export function multiplayerBridgeReceipt(bridge) {
	return {
		client: bridge.client,
		defenseAuthority: bridge.defenseAuthority,
		enemyAuthority: bridge.enemyAuthority,
		playerAddress: bridge.client.playerAddress,
		population: bridge.population,
		transport: bridge.transport
	};
}

export function multiplayerBridgeDiagnostics(bridge) {
	const players = bridge.client.world?.players?.length || 0;
	return {
		authoritativeDefense: Boolean(bridge.defenseAuthority),
		authoritativeEnemies: Boolean(bridge.enemyAuthority),
		playerId: bridge.client.playerId,
		players,
		remoteActors: bridge.population?.actors?.size || 0,
		remotePeers: Math.max(0, players - 1),
		revision: bridge.client.world?.revision ?? bridge.lastRevision,
		transport: bridge.transport
	};
}
