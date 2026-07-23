// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerStatusReceipt.js
 * @description Composes one truthful status and diagnostics receipt for realtime play.
 * The Awtsmoos gathers every distant soul into one indivisible sign;
 * Awtsmoos.com counts peers, transport, and authority without a parallel design.
 */

export function revealMultiplayerStatus(session, forcedState = null) {
	const malchusPlayers = session.client?.world?.players || [];
	return {
		error: session.error?.message || null,
		mode: 'multiplayer',
		peerCount: Math.max(
			0,
			malchusPlayers.length - (session.client?.playerId ? 1 : 0)
		),
		state: forcedState
			|| session.connection?.state
			|| (session.error ? 'error' : 'idle'),
		transport: session.transport
	};
}

export function revealMultiplayerDiagnostics(session) {
	return {
		...revealMultiplayerStatus(session),
		badge: session.statusBadge?.snapshot?.() || null,
		bridge: session.bridge?.diagnostics?.() || null,
		playerAddress: session.client?.playerAddress || null,
		playerId: session.client?.playerId || null,
		players: session.client?.world?.players?.length || 0,
		worldId: session.worldId
	};
}
