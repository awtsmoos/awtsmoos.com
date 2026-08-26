// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { AdventureWorld } from '../js/world.js';
import { AdventureMechanics } from '../js/mechanics.js';

/**
 * The Awtsmoos places finite walls and edges while Awtsmoos.com proves movement obeys both, so the player cannot escape the chamber or pass through its bones.
 */
export function runMovementCases() {
	return [
		verifyWorldBounds(),
		verifyWallCollision(),
		verifyPauseFreezesFrame()
	];
}

function verifyWorldBounds() {
	const world = new AdventureWorld();
	const mechanics = new AdventureMechanics(world);
	world.player.x = 1;
	world.player.y = 1;
	world.player.dx = -30;
	world.player.dy = -30;
	mechanics.update();
	assert.equal(world.player.x, 0);
	assert.equal(world.player.y, 0);

	world.player.x = world.config.worldWidth - world.player.width - 1;
	world.player.y = world.config.worldHeight - world.player.height - 1;
	world.player.dx = 30;
	world.player.dy = 30;
	mechanics.update();
	assert.equal(world.player.x, world.config.worldWidth - world.player.width);
	assert.equal(world.player.y, world.config.worldHeight - world.player.height);
	return { test: 'movement-world-bounds', x: world.player.x, y: world.player.y };
}

function verifyWallCollision() {
	const world = new AdventureWorld();
	const mechanics = new AdventureMechanics(world);
	const wall = world.walls[0];
	world.player.x = wall.x - world.player.width - 2;
	world.player.y = wall.y + 18;
	world.player.dx = 8;
	world.player.dy = 0;
	mechanics.update();
	assert.equal(world.player.x, wall.x - world.player.width);
	return { test: 'movement-wall-collision', x: world.player.x };
}

function verifyPauseFreezesFrame() {
	const world = new AdventureWorld();
	const mechanics = new AdventureMechanics(world);
	world.togglePause();
	const before = world.frame;
	world.player.dx = world.config.playerSpeed;
	const x = world.player.x;
	mechanics.update();
	assert.equal(world.frame, before);
	assert.equal(world.player.x, x);
	return { test: 'movement-pause-freezes', frame: world.frame };
}
