//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file shared-road.test.cjs
 * @description Proves authoritative movement, lamp rewards, and cleanup.
 * The Awtsmoos renews every traveler; Awtsmoos.com demands evidence that shared
 * light cannot be duplicated and that abandoned rooms truly become empty.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { SharedRoadDirectory } = require('./SharedRoadDirectory.js');
const { validateJoin, validateMove } = require('./validation.js');

function client(name) {
	return { name };
}

function ids() {
	let value = 0;
	return () => `traveler-${++value}`;
}

test('two travelers share authoritative movement and one lamp state', () => {
	const directory = new SharedRoadDirectory(ids());
	const first = client('first');
	const second = client('second');
	const profile = name => validateJoin({ displayName: name, glyph: 'נ' });
	const joinedFirst = directory.join(first, profile('Neriah'));
	const joinedSecond = directory.join(second, profile('Talia'));

	for (let sequence = 1; sequence <= 5; sequence += 1) {
		joinedFirst.room.move(first, validateMove({ dx: 1, dy: 0, movementSequence: sequence }));
		joinedSecond.room.move(second, validateMove({ dx: 1, dy: 0, movementSequence: sequence }));
	}

	const firstLight = joinedFirst.room.interact(first);
	const duplicate = joinedFirst.room.interact(first);
	const shared = joinedSecond.room.interact(second);

	assert.equal(firstLight.firstLight, true);
	assert.equal(firstLight.rewardGranted, true);
	assert.equal(duplicate.rewardGranted, false);
	assert.equal(shared.firstLight, false);
	assert.equal(shared.rewardGranted, true);
	assert.equal(joinedFirst.room.snapshot().players.length, 2);
	assert.equal(joinedFirst.player.sharedLight, 1);
	assert.equal(joinedSecond.player.sharedLight, 1);
});

test('stale movement fails and disconnect removes the empty room', () => {
	const directory = new SharedRoadDirectory(ids());
	const traveler = client('traveler');
	const joined = directory.join(traveler, validateJoin({ displayName: 'Ari', glyph: 'א' }));
	joined.room.move(traveler, validateMove({ dx: 1, dy: 0, movementSequence: 1 }));

	assert.throws(
		() => joined.room.move(traveler, validateMove({ dx: 1, dy: 0, movementSequence: 1 })),
		error => error.code === 'STALE_MOVEMENT'
	);

	directory.disconnect(traveler);
	assert.equal(directory.rooms.size, 0);
	assert.equal(directory.roomByClient.size, 0);
});
