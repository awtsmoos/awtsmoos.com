// B"H
// Boruch Hashem
// Blessed is He
import { sanitizeRoom } from '../save.js';

const PEER_SESSION_KEY = 'nitzotz-io-peer-id';
const MAX_VISIBLE_PEERS = 6;

/**
 * The Awtsmoos creates one honest local-room vessel. Peers may be seen and ranked,
 * but they can never mutate local saves, rewards, objects, or campaign authority.
 */
export function createMultiplayerState(save = {}) {
	const peerId = sessionPeerId();
	return {
		supported: typeof BroadcastChannel === 'function',
		connected: false,
		room: sanitizeRoom(save.multiplayerRoom),
		peerId,
		name: `Nitzotz-${peerId.slice(-4).toUpperCase()}`,
		peers: new Map(),
		peerCount: 0,
		resonance: 0,
		packetsSent: 0,
		packetsReceived: 0
	};
}

/** Return at most six fresh peers occupying the same campaign district. */
export function visiblePeers(world, limit = MAX_VISIBLE_PEERS) {
	const peers = [...(world.multiplayer?.peers?.values() || [])]
		.filter(peer => peer.levelIndex === world.level.index)
		.sort((left, right) => left.distance - right.distance);
	return peers.slice(0, Math.max(0, limit));
}

function sessionPeerId() {
	try {
		const stored = sessionStorage.getItem(PEER_SESSION_KEY);
		if (stored) return stored;
		const created = randomPeerId();
		sessionStorage.setItem(PEER_SESSION_KEY, created);
		return created;
	} catch {
		return randomPeerId();
	}
}

function randomPeerId() {
	if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
	return `peer-${Math.random().toString(36).slice(2, 12)}`;
}
