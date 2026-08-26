// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { AdventureWorld } from '../js/world.js';
import { AdventureMechanics } from '../js/mechanics.js';

/**
 * The Awtsmoos lets collected light become earned passage; Awtsmoos.com proves sparks, key, shadow, and gate form one causal game loop instead of decoration.
 */
export function runProgressionCases() {
	return [
		verifySparkAndKeyGate(),
		verifyHazardDamage(),
		verifyPortalProgression()
	];
}

function placePlayer(world, item) {
	world.player.x = item.x;
	world.player.y = item.y;
	world.player.dx = 0;
	world.player.dy = 0;
}

function verifySparkAndKeyGate() {
	const world = new AdventureWorld();
	const mechanics = new AdventureMechanics(world);
	placePlayer(world, world.key);
	mechanics.update();
	assert.equal(world.keyCollected, false);
	assert.match(world.message, /sleeps/i);

	while (world.sparks.length) {
		placePlayer(world, world.sparks[0]);
		mechanics.update();
	}
	assert.equal(world.sparks.length, 0);
	placePlayer(world, world.key);
	mechanics.update();
	assert.equal(world.keyCollected, true);
	assert.equal(world.portalReady, true);
	assert.equal(world.score, world.config.sparkScore * world.sparkGoal + world.config.keyScore);
	return { test: 'progression-spark-key-gate', snapshot: world.snapshot() };
}

function verifyHazardDamage() {
	const world = new AdventureWorld();
	const mechanics = new AdventureMechanics(world);
	world.graceFrames = 0;
	placePlayer(world, world.hazards[0]);
	const beforeLives = world.lives;
	mechanics.update();
	assert.equal(world.lives, beforeLives - 1);
	assert.equal(world.player.x, world.spawn.x);
	assert.equal(world.player.y, world.spawn.y);
	assert.ok(world.graceFrames > 0);
	return { test: 'progression-hazard-damage', snapshot: world.snapshot() };
}

function verifyPortalProgression() {
	const world = new AdventureWorld();
	const mechanics = new AdventureMechanics(world);
	placePlayer(world, world.portal);
	mechanics.update();
	assert.equal(world.stageIndex, 0);
	assert.match(world.message, /waits/i);
	world.sparks = [];
	world.keyCollected = true;
	placePlayer(world, world.portal);
	mechanics.update();
	assert.equal(world.stageIndex, 1);
	assert.equal(world.score, world.config.stageBonus);
	return { test: 'progression-portal-stage', snapshot: world.snapshot() };
}
