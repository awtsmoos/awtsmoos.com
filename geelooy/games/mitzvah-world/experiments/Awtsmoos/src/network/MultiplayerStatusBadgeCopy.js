// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerStatusBadgeCopy.js
	* @description Normalizes realtime status and reveals concise, truthful player-facing copy.
	* The Awtsmoos lets every hidden wire confess its present condition; Awtsmoos.com names
	* connection, reconnection, local fallback, solitude, and rest without false certainty.
	*/

export function normalizeMultiplayerStatus(status = {}) {
	const mode = status.mode === 'singleplayer' ? 'singleplayer' : 'multiplayer';
	return {
		error: status.error ? String(status.error) : null,
		mode,
		peerCount: mode === 'singleplayer'
			? 0
			: Math.max(0, Math.floor(Number(status.peerCount) || 0)),
		state: mode === 'singleplayer'
			? 'singleplayer'
			: String(status.state || 'connecting'),
		transport: mode === 'singleplayer'
			? 'none'
			: String(status.transport || 'unknown')
	};
}

export function multiplayerStateLabel(status) {
	if (status.mode === 'singleplayer') return 'Solo world';
	if (status.state === 'connected') return 'Connected realtime';
	if (status.state === 'connecting') return 'Connecting…';
	if (reconnectingState(status.state)) return 'Reconnecting…';
	if (status.state === 'offline-local') return 'Offline · playing locally';
	if (status.state === 'error' || status.state === 'failed') {
		return 'Realtime unavailable';
	}
	if (status.state === 'stopped') return 'Disconnected';
	return 'Starting realtime…';
}

export function multiplayerDetailLabel(status) {
	if (status.mode === 'singleplayer') return 'Local only · 0 peers';
	if (status.state === 'offline-local') {
		return `${transportLabel(status.transport)} unavailable · local play continues`;
	}
	const peerWord = status.peerCount === 1 ? 'peer' : 'peers';
	return `${transportLabel(status.transport)} · ${status.peerCount} ${peerWord}`;
}

export function multiplayerStatusIsHealthy(status) {
	return status.state === 'connected' || status.state === 'singleplayer';
}

function reconnectingState(state) {
	return state === 'reconnecting' || state === 'waiting-to-reconnect';
}

function transportLabel(transport) {
	if (transport === 'local-tab') return 'Local tabs';
	if (transport === 'websocket') return 'WebSocket';
	if (transport === 'none') return 'Local';
	return transport || 'Realtime';
}
