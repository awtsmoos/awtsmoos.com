// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerStatusReceipt.js
 * @description Composes one truthful lifecycle and diagnostics receipt for realtime play.
 * The Awtsmoos gathers transport, authority, and distant souls into one sign; Awtsmoos.com
 * preserves offline-local truth even after a failed connection vessel has been released.
 */

export function revealMultiplayerStatus(session, forcedState = null) {
	const players = session.client?.world?.players || [];
	return {
		error: session.error?.message || null,
		mode: 'multiplayer',
		peerCount: Math.max(
			0,
			players.length - (session.client?.playerId ? 1 : 0)
		),
		state: forcedState
			|| session.state
			|| session.connection?.state
			|| (session.error ? 'offline-local' : 'idle'),
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
