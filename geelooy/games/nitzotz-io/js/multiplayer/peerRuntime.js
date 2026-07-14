// B"H
// Boruch Hashem
// Blessed is He
import { normalizePacket } from './packetSchema.js';

const MAX_STORED_PEERS = 12;

/** Validate and apply one peer packet without touching local gameplay authority. */
export function applyPeerPacket(state, raw, now = Date.now()) {
	const packet = normalizePacket(raw);
	if (!packet || packet.peerId === state.peerId) return false;
	state.packetsReceived += 1;
	if (packet.type === 'leave') {
		state.peers.delete(packet.peerId);
		return true;
	}
	const peer = state.peers.get(packet.peerId) || createPeer(packet);
	peer.name = packet.name;
	peer.levelIndex = packet.levelIndex;
	peer.modeId = packet.modeId;
	peer.targetX = packet.x;
	peer.targetY = packet.y;
	peer.targetZ = packet.z;
	peer.mass = packet.mass;
	peer.r = packet.radius;
	peer.armor = packet.armor;
	peer.maxArmor = packet.maxArmor;
	peer.color = packet.color;
	peer.lastSeen = now;
	state.peers.set(packet.peerId, peer);
	prunePeers(state);
	return true;
}

/** Interpolate fresh peers and expire every silent room presence after three seconds. */
export function updatePeerState(world, dt, now = Date.now()) {
	const state = world.multiplayer;
	let sameLevel = 0;
	let resonance = 0;
	for (const [peerId, peer] of state.peers) {
		if (now - peer.lastSeen > 3000) {
			state.peers.delete(peerId);
			continue;
		}
		const amount = Math.min(1, dt * 10);
		peer.x += (peer.targetX - peer.x) * amount;
		peer.y += (peer.targetY - peer.y) * amount;
		peer.z += (peer.targetZ - peer.z) * amount;
		peer.distance = Math.hypot(peer.x - world.player.x, peer.y - world.player.y);
		if (peer.levelIndex === world.level.index) {
			sameLevel += 1;
			if (peer.distance < world.player.r * 10) resonance += 1;
		}
	}
	state.peerCount = sameLevel;
	state.resonance = Math.min(3, resonance);
}

function createPeer(packet) {
	return {
		...packet,
		x: packet.x,
		y: packet.y,
		z: packet.z,
		targetX: packet.x,
		targetY: packet.y,
		targetZ: packet.z,
		distance: Infinity,
		lastSeen: packet.sentAt
	};
}

function prunePeers(state) {
	if (state.peers.size <= MAX_STORED_PEERS) return;
	const oldest = [...state.peers.values()].sort((left, right) => left.lastSeen - right.lastSeen);
	for (const peer of oldest.slice(0, state.peers.size - MAX_STORED_PEERS)) {
		state.peers.delete(peer.peerId);
	}
}
