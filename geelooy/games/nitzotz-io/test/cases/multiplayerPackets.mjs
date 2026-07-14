// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	applyPeerPacket,
	normalizePacket,
	snapshotPacket
} from '../../js/multiplayer/packets.js';
import { createMultiplayerState } from '../../js/multiplayer/state.js';
import { createWorld } from '../../js/state.js';

/** Verify bounded public packet schema, hostile normalization, and local authority. */
export function runMultiplayerPacketCases() {
	return [
		checkSnapshotSchema(),
		checkHostilePacketRejection(),
		checkLocalAuthorityIsolation()
	];
}

function checkSnapshotSchema() {
	const world = createWorld();
	const state = createMultiplayerState(world.save);
	const packet = snapshotPacket(world, state, 1234);
	assert.deepEqual(Object.keys(packet).sort(), [
		'armor', 'color', 'levelIndex', 'mass', 'maxArmor', 'modeId', 'name',
		'peerId', 'radius', 'sentAt', 'type', 'version', 'x', 'y', 'z'
	].sort());
	assert.equal(packet.sentAt, 1234);
	assert.equal('save' in packet, false);
	assert.equal('objects' in packet, false);
	return { test: 'multiplayer-snapshot-schema', fields: Object.keys(packet).length };
}

function checkHostilePacketRejection() {
	assert.equal(normalizePacket(null), null);
	assert.equal(normalizePacket({ version: 9, type: 'state', peerId: 'x' }), null);
	assert.equal(normalizePacket({ version: 1, type: 'steal', peerId: 'x' }), null);
	const packet = normalizePacket({
		version: 1,
		type: 'state',
		peerId: '<script>peer</script>',
		name: '<b>Aggressor</b>',
		levelIndex: 900,
		x: Infinity,
		y: -Infinity,
		mass: 1e20,
		radius: -8,
		armor: 99,
		color: [4, -2, null]
	});
	assert.ok(packet);
	assert.equal(packet.levelIndex, 199);
	assert.equal(packet.mass, 100000);
	assert.equal(packet.radius, 1);
	assert.equal(packet.armor, 8);
	assert.deepEqual(packet.color, [1, 0, 0]);
	return { test: 'multiplayer-hostile-packet-rejection', peerId: packet.peerId };
}

function checkLocalAuthorityIsolation() {
	const world = createWorld();
	const saveBefore = JSON.stringify(world.save);
	const objectsBefore = world.level.objects.length;
	applyPeerPacket(world.multiplayer, {
		...peerPacket('peer-safe', world.level.index, 20, 30, 1000),
		save: { perutot: 999999 },
		objects: [],
		reward: 999999
	}, 1000);
	assert.equal(JSON.stringify(world.save), saveBefore);
	assert.equal(world.level.objects.length, objectsBefore);
	assert.equal(world.multiplayer.peers.has('peer-safe'), true);
	return { test: 'multiplayer-local-authority-isolation', objects: objectsBefore };
}

export function peerPacket(peerId, levelIndex, x, y, sentAt) {
	return {
		version: 1,
		type: 'state',
		peerId,
		name: peerId,
		levelIndex,
		modeId: 'hevruta',
		x,
		y,
		z: 0,
		mass: 40,
		radius: 30,
		armor: 1,
		maxArmor: 2,
		color: [0.4, 0.8, 1],
		sentAt
	};
}
