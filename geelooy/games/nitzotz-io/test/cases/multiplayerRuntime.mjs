// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	applyPeerPacket,
	updatePeerState
} from '../../js/multiplayer/packets.js';
import { visiblePeers } from '../../js/multiplayer/state.js';
import { createWorld } from '../../js/state.js';
import { peerPacket } from './multiplayerPackets.mjs';

/** Verify discovery, interpolation, expiry, same-level counting, resonance, and caps. */
export function runMultiplayerRuntimeCases() {
	return [
		checkPeerInterpolationAndExpiry(),
		checkVisiblePeerCap(),
		checkSameLevelFiltering()
	];
}

function checkPeerInterpolationAndExpiry() {
	const world = createWorld();
	const state = world.multiplayer;
	const now = 5000;
	applyPeerPacket(state, peerPacket('peer-a', world.level.index, 100, 80, now), now);
	const peer = state.peers.get('peer-a');
	assert.equal(peer.x, 100);
	assert.equal(peer.y, 80);
	applyPeerPacket(state, peerPacket('peer-a', world.level.index, 200, 160, now + 50), now + 50);
	updatePeerState(world, 0.05, now + 100);
	assert.ok(peer.x > 100 && peer.x < 200);
	assert.ok(peer.y > 80 && peer.y < 160);
	assert.equal(state.peerCount, 1);
	updatePeerState(world, 0.05, now + 4001);
	assert.equal(state.peers.has('peer-a'), false);
	assert.equal(state.peerCount, 0);
	return { test: 'multiplayer-interpolation-expiry', expired: true };
}

function checkVisiblePeerCap() {
	const world = createWorld();
	const now = 8000;
	for (let index = 0; index < 9; index += 1) {
		applyPeerPacket(
			world.multiplayer,
			peerPacket(`peer-${index}`, world.level.index, index * 20, 0, now + index),
			now + index
		);
	}
	updatePeerState(world, 0.1, now + 20);
	assert.equal(visiblePeers(world).length, 6);
	assert.equal(world.multiplayer.peers.size, 9);
	return { test: 'multiplayer-visible-peer-cap', visible: 6 };
}

function checkSameLevelFiltering() {
	const world = createWorld();
	const now = 12000;
	applyPeerPacket(
		world.multiplayer,
		peerPacket('same-level', world.level.index, 12, 0, now),
		now
	);
	applyPeerPacket(
		world.multiplayer,
		peerPacket('other-level', world.level.index + 1, 8, 0, now),
		now
	);
	updatePeerState(world, 0.1, now + 20);
	assert.equal(world.multiplayer.peerCount, 1);
	assert.equal(visiblePeers(world).length, 1);
	assert.equal(world.multiplayer.resonance, 1);
	return { test: 'multiplayer-same-level-filtering', peers: 1 };
}
