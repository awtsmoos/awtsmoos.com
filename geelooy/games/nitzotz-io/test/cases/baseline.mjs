// B"H
import assert from 'node:assert/strict';
import { buildRenderList } from '../../js/engine/renderList.js';
import { step, togglePause } from '../../js/game.js';
import { finishRound } from '../../js/game/progression.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { createWorld } from '../../js/state.js';

export function runBaselineCases() {
	return [
		checkLevelCatalog(),
		checkPersistentArena(),
		checkAbsorptionGrowth(),
		checkCompositeModelsAndTraffic(),
		checkPowerup(),
		checkPause(),
		checkTimedVictory()
	];
}

function checkLevelCatalog() {
	assert.equal(LEVELS.length, 6);
	assert.equal(new Set(LEVELS.map(level => level.key)).size, 6);
	assert.ok(LEVELS.every(level => level.bonus?.target > 0));
	return { test: 'levels', names: LEVELS.map(level => level.name) };
}

function checkPersistentArena() {
	const world = createWorld();
	const reference = world.level.objects;
	world.mode = 'playing';
	world.input.x = 1;
	for (let frame = 0; frame < 120; frame += 1) step(world, 1 / 60);
	assert.equal(world.level.objects, reference);
	assert.ok(reference.length >= 250);
	return { test: 'persistent-arena', objects: reference.length, playerX: Math.round(world.player.x) };
}

function checkAbsorptionGrowth() {
	const world = createWorld();
	const object = world.level.objects.find(candidate => candidate.r <= world.player.r * 0.65 && !candidate.traffic);
	assert.ok(object);
	world.mode = 'playing';
	object.x = world.player.x;
	object.y = world.player.y;
	const before = world.player.mass;
	for (let frame = 0; frame < 100; frame += 1) step(world, 1 / 60);
	assert.equal(object.taken, true);
	assert.ok(world.player.mass > before);
	return { test: 'absorption', before, after: world.player.mass, object: object.name };
}

function checkCompositeModelsAndTraffic() {
	const world = createWorld();
	const traffic = world.level.objects.find(object => object.traffic);
	assert.ok(traffic);
	const before = [traffic.x, traffic.y];
	world.mode = 'playing';
	for (let frame = 0; frame < 60; frame += 1) step(world, 1 / 60);
	assert.notDeepEqual([traffic.x, traffic.y], before);
	const commands = buildRenderList(world, 1);
	assert.ok(commands.some(command => command.mesh.startsWith('model:')));
	assert.ok(commands.some(command => command.mesh === 'disc'));
	assert.ok(commands.every(finiteCommand));
	return {
		test: 'procedural-models-traffic',
		modelCommands: commands.filter(command => command.mesh.startsWith('model:')).length,
		trafficRemaining: world.level.objects.filter(object => object.traffic && !object.taken).length
	};
}

function checkPowerup() {
	const world = createWorld();
	const pickup = world.level.objects.find(object => object.power === 'time');
	assert.ok(pickup);
	world.mode = 'playing';
	world.timeLeft = 20;
	pickup.x = world.player.x;
	pickup.y = world.player.y;
	for (let frame = 0; frame < 100; frame += 1) step(world, 1 / 60);
	assert.equal(pickup.taken, true);
	assert.ok(world.timeLeft > 26);
	return { test: 'powerup', power: pickup.power, time: world.timeLeft };
}

function checkPause() {
	const world = createWorld();
	world.mode = 'playing';
	togglePause(world);
	assert.equal(world.mode, 'paused');
	const time = world.timeLeft;
	step(world, 1);
	assert.equal(world.timeLeft, time);
	togglePause(world);
	assert.equal(world.mode, 'playing');
	return { test: 'pause', mode: world.mode };
}

function checkTimedVictory() {
	const world = createWorld();
	world.mode = 'playing';
	world.player.mass = world.level.targetMass * 1.7;
	world.consumed[world.level.bonus.category] = world.level.bonus.target;
	finishRound(world);
	assert.equal(world.mode, 'won');
	assert.equal(world.stars, 3);
	return { test: 'timed-victory', stars: world.stars, unlocked: world.save.unlocked };
}

function finiteCommand(command) {
	return [...command.pos, ...command.scale, command.rot, command.tilt || 0, command.alpha, command.glow].every(Number.isFinite);
}
