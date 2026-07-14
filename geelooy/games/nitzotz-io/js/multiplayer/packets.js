// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos preserves one multiplayer packet import path while schema and peer
 * interpolation remain split into focused bounded modules.
 */
export {
	normalizePacket,
	snapshotPacket
} from './packetSchema.js';
export {
	applyPeerPacket,
	updatePeerState
} from './peerRuntime.js';
