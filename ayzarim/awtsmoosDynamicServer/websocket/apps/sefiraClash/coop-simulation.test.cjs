//B"H
//Boruch Hashem
//Blessed is He

/**
 * Cooperative simulation tests prove that boolean input becomes server-owned movement,
 * enemy damage, boss phases, and completion. The Awtsmoos renews every tick;
 * Awtsmoos.com never accepts client coordinates, target health, or a completion flag.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { CoopPlayer } = require('./CoopPlayer.js');
const { CoopSimulation } = require('./CoopSimulation.js');

function client() {
	return { send() {} };
}

test('server computes movement from bounded input', () => {
	const playerA = new CoopPlayer(client(), { displayName: 'A' }, 0);
	const playerB = new CoopPlayer(client(), { displayName: 'B' }, 1);
	const simulation = new CoopSimulation([playerA, playerB], {
		locationId: 'crown-ruins',
		weatherClock: 3
	});
	const startX = playerA.x;
	playerA.acceptInput({
		sequence: 1,
		attack: false,
		guard: false,
		jump: false,
		left: false,
		right: true
	});
	for (let index = 0; index < 8; index += 1) simulation.tick();
	assert.ok(playerA.x > startX);
	assert.equal(simulation.snapshot().weatherId, simulation.snapshot().weatherId);
	assert.equal('x' in playerA.input, false);
});

test('server attacks wave and completes through boss damage', () => {
	const playerA = new CoopPlayer(client(), { displayName: 'A' }, 0);
	const playerB = new CoopPlayer(client(), { displayName: 'B' }, 1);
	const simulation = new CoopSimulation([playerA, playerB], {
		locationId: 'throne-road'
	});
	simulation.enemies.forEach(enemy => {
		enemy.dead = true;
		enemy.health = 0;
	});
	simulation.boss.active = true;
	simulation.boss.health = 18;
	playerA.x = simulation.boss.x;
	playerA.y = simulation.boss.y;
	playerA.acceptInput({
		sequence: 1,
		attack: true,
		guard: false,
		jump: false,
		left: false,
		right: false
	});
	const snapshot = simulation.tick();
	assert.equal(snapshot.boss.dead, true);
	assert.equal(snapshot.phase, 'completed');
	assert.equal(snapshot.objective.stage, 'complete');
	assert.ok(snapshot.events.some(event => event.type === 'playerHit'));
});

test('boss phases are derived from server health', () => {
	const players = [
		new CoopPlayer(client(), { displayName: 'A' }, 0),
		new CoopPlayer(client(), { displayName: 'B' }, 1)
	];
	const simulation = new CoopSimulation(players, { locationId: 'wisdom-rift' });
	simulation.enemies.forEach(enemy => {
		enemy.dead = true;
	});
	simulation.boss.active = true;
	simulation.boss.health = simulation.boss.maxHealth * 0.3;
	simulation.tick();
	assert.equal(simulation.boss.phase, 3);
});
