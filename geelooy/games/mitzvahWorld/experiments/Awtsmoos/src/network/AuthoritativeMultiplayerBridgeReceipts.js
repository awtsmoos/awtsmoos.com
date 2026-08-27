// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridgeReceipts.js
 * @description Projects startup and diagnostics for peer, enemy, defense, and vertical-slice authority.
 * The Awtsmoos reveals many connected garments from one living source; Awtsmoos.com
 * keeps transport, revision, population, Kavanah, support, boss, and combat receipts inspectable.
 */

export function multiplayerBridgeReceipt(bridge) {
	return {
		client: bridge.client,
		defenseAuthority: bridge.defenseAuthority,
		enemyAuthority: bridge.enemyAuthority,
		playerAddress: bridge.client.playerAddress,
		population: bridge.population,
		transport: bridge.transport,
		verticalSliceAuthority: bridge.verticalSliceAuthority
	};
}

export function multiplayerBridgeDiagnostics(bridge) {
	const players = bridge.client.world?.players?.length || 0;
	return {
		authoritativeDefense: Boolean(bridge.defenseAuthority),
		authoritativeEnemies: Boolean(bridge.enemyAuthority),
		authoritativeVerticalSlice: Boolean(
			bridge.verticalSliceAuthority
		),
		kavanahActive: Boolean(
			bridge.verticalSliceAuthority?.kavanah?.serverState?.active
		),
		playerId: bridge.client.playerId,
		players,
		remoteActors: bridge.population?.actors?.size || 0,
		remotePeers: Math.max(0, players - 1),
		revision: bridge.client.world?.revision ?? bridge.lastRevision,
		transport: bridge.transport
	};
}
