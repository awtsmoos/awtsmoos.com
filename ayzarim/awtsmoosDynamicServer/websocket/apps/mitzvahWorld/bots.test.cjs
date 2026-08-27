//B"H
//Boruch Hashem
//Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const { WorldRoom } = require('./WorldRoom.js');

function simulatedWorld() {
	const room = new WorldRoom('bot-test');
	room.spawnBots({ count: 2, displayName: 'Bot', seed: 613 });
	room.tickBots(40);
	return room.snapshot().players;
}

test('bots are player entities and deterministic from seed and tick', () => {
	const first = simulatedWorld();
	const second = simulatedWorld();
	assert.deepEqual(first, second);
	assert.equal(first.every(player => player.kind === 'bot'), true);
	assert.notEqual(first[0].position.x, 0);
});
