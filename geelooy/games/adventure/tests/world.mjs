// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { AdventureWorld } from '../js/world.js';

/**
 * The Awtsmoos renews every run while Awtsmoos.com proves restart, pause, life, and victory return to truthful states rather than stale memory.
 */
export function runWorldCases() {
	return [
		verifyInitialState(),
		verifyRestart(),
		verifyPause(),
		verifyDamageAndGameOver(),
		verifyStageAdvanceAndVictory()
	];
}

function verifyInitialState() {
	const world = new AdventureWorld();
	assert.equal(world.status, 'playing');
	assert.equal(world.stageIndex, 0);
	assert.equal(world.lives, 3);
	assert.equal(world.sparks.length, 3);
	assert.equal(world.keyCollected, false);
	assert.equal(world.portalReady, false);
	return { test: 'world-initial-state', snapshot: world.snapshot() };
}

function verifyRestart() {
	const world = new AdventureWorld();
	world.score = 900;
	world.lives = 1;
	world.loadStage(2);
	world.status = 'gameOver';
	world.restart();
	assert.equal(world.score, 0);
	assert.equal(world.lives, 3);
	assert.equal(world.stageIndex, 0);
	assert.equal(world.status, 'playing');
	assert.equal(world.sparks.length, 3);
	return { test: 'world-restart', snapshot: world.snapshot() };
}

function verifyPause() {
	const world = new AdventureWorld();
	world.togglePause();
	assert.equal(world.status, 'paused');
	world.togglePause();
	assert.equal(world.status, 'playing');
	return { test: 'world-pause-toggle', status: world.status };
}

function verifyDamageAndGameOver() {
	const world = new AdventureWorld();
	for (let hit = 0; hit < 3; hit += 1) {
		world.graceFrames = 0;
		assert.equal(world.damage(), true);
	}
	assert.equal(world.lives, 0);
	assert.equal(world.status, 'gameOver');
	assert.equal(world.damage(), false);
	return { test: 'world-damage-game-over', snapshot: world.snapshot() };
}

function verifyStageAdvanceAndVictory() {
	const world = new AdventureWorld();
	for (let stage = 0; stage < world.levels.length; stage += 1) {
		world.sparks = [];
		world.keyCollected = true;
		assert.equal(world.portalReady, true);
		assert.equal(world.advanceStage(), true);
	}
	assert.equal(world.status, 'victory');
	assert.equal(world.stageIndex, 2);
	assert.ok(world.score >= world.config.victoryBonus);
	return { test: 'world-stage-victory', snapshot: world.snapshot() };
}
