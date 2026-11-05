//B"H
//Boruch Hashem
//Blessed is He

/**
 * A focused witness that a village room remains stable while its use evolves.
 * The Awtsmoos renews existence each instant; this test proves the room vessel
 * is deterministic, bounded, restorable, and silent while idle.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import RoomSystem from './../../src/world/RoomSystem.js';

test('RoomSystem creates stable purposeful rooms and detached copies', () => {
	const rooms = new RoomSystem();
	const created = rooms.createRoom({
		id: 'H18-kitchen',
		purpose: 'kitchen',
		doorwayIds: ['H18-entry'],
		furnitureIds: ['H18-table']
	});
	created.doorwayIds.push('foreign-change');
	assert.equal(rooms.getRoom('H18-kitchen').purpose, 'kitchen');
	assert.deepEqual(rooms.getRoom('H18-kitchen').doorwayIds, ['H18-entry']);
	assert.throws(() => rooms.createRoom({ id: 'H18-kitchen' }), /already exists/i);
	assert.throws(() => rooms.createRoom({ purpose: 'study' }), /stable id/i);
});

test('RoomSystem updates purpose, snapshots, restores, and emits safe events', () => {
	const source = new RoomSystem();
	const eventTypes = [];
	source.subscribe((event) => eventTypes.push(event.type));
	source.createRoom({ id: 'H21-study', type: 'library' });
	source.setRoomPurpose('H21-study', 'Torah study');
	const snapshot = source.snapshot();
	const restored = new RoomSystem();
	let restoredEvent = null;
	restored.subscribe((event) => restoredEvent = event);
	restored.restore(snapshot);
	assert.equal(restored.getRoom('H21-study').purpose, 'Torah study');
	assert.equal(restoredEvent.type, 'rooms:restored');
	assert.equal(restoredEvent.detail.rooms.length, 1);
	assert.deepEqual(eventTypes, ['room:created', 'room:updated']);
});

test('RoomSystem removes rooms, cleans listeners, and has no update loop', () => {
	const rooms = new RoomSystem();
	let events = 0;
	rooms.subscribe(() => events += 1);
	rooms.addRoom({ id: 'H24-guest', purpose: 'guest room' });
	assert.equal(rooms.deleteRoom('H24-guest'), true);
	rooms.destroy();
	rooms.registerRoom({ id: 'H24-storage', purpose: 'storage' });
	assert.equal(events, 2);
	assert.equal(typeof rooms.update, 'undefined');
});
