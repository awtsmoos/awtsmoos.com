// B"H
// Headless proofs for the course run state machine: timer honesty, ordered
// checkpoints, finish gating, hazard/kill-plane respawn, coins, mover carry,
// surface friction, and the no-snap-from-below ground rule.

import assert from 'node:assert/strict';
import test from 'node:test';
import { CourseEngine } from '../CourseEngine.js';
import { COURSE_DEFINITIONS, courseDefinitionById } from '../courseDefinitions.js';

function fakeStorage() {
	const map = new Map();
	return {
		getItem: key => (map.has(key) ? map.get(key) : null),
		setItem: (key, value) => map.set(key, String(value))
	};
}

function fakePlayer() {
	return {
		x: 0, y: 0, z: 0, renderY: 0, velY: 0,
		grounded: true, facing: 0,
		courseFriction: null, courseInvulnUntil: 0
	};
}

function place(player, x, y, z) {
	player.x = x;
	player.y = y;
	player.renderY = y;
	player.z = z;
	player.velY = 0;
	player.grounded = true;
}

function dashEngine(storage = fakeStorage()) {
	return new CourseEngine(courseDefinitionById('meadow-dash'), { storage });
}

test('all built-in courses construct without throwing', () => {
	for (const def of COURSE_DEFINITIONS) {
		assert.doesNotThrow(() => new CourseEngine(def, { storage: fakeStorage() }), def.id);
	}
});

test('activate places the player at spawn and starts the clock', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	const events = [];
	engine.onEvent = (type, data) => events.push([type, data]);
	engine.activate(player);
	assert.equal(player.x, 0);
	assert.equal(player.z, 2994);
	assert.equal(engine.running, true);
	assert.equal(events[0][0], 'start');
});

test('the timer advances on real frame delta only', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	engine.beforePlayerFrame(player, 0.2);
	assert.equal(engine.courseTime, 0.2);
	engine.beforePlayerFrame(player, 0.2);
	assert.ok(Math.abs(engine.courseTime - 0.4) < 1e-9);
	engine.paused = true;
	engine.beforePlayerFrame(player, 1);
	assert.ok(Math.abs(engine.courseTime - 0.4) < 1e-9);
});

test('frame-time spikes are clamped so physics stays stable', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	engine.beforePlayerFrame(player, 5); // 5s hitch
	assert.ok(engine.courseTime <= 0.25 + 1e-9, `courseTime=${engine.courseTime}`);
});

test('checkpoints must be touched in order', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	// Jump straight to checkpoint 2 — must not count.
	place(player, 0, 2.0, 3072);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.checkpointIndex, 0);
	// Touch checkpoint 1 first.
	place(player, 0, 1.0, 3049);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.checkpointIndex, 1);
	// Now checkpoint 2 counts.
	place(player, 0, 2.0, 3072);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.checkpointIndex, 2);
});

test('finish requires all checkpoints and records a best time', () => {
	const storage = fakeStorage();
	const engine = dashEngine(storage);
	const player = fakePlayer();
	const events = [];
	engine.onEvent = (type, data) => events.push([type, data]);
	engine.activate(player);
	// Straight to the finish with no checkpoints: no finish.
	place(player, 0, 2.0, 3089);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.finished, false);
	// Earn the checkpoints, then finish.
	place(player, 0, 1.0, 3049);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	place(player, 0, 2.0, 3072);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	for (let i = 0; i < 600; i++) engine.beforePlayerFrame(player, 1 / 60); // 10s
	place(player, 0, 2.0, 3089);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.finished, true);
	const finishEvent = events.find(([type]) => type === 'finish');
	assert.ok(finishEvent, 'finish event emitted');
	assert.ok(finishEvent[1].finalMs > 9000, `finalMs=${finishEvent[1].finalMs}`);
	assert.equal(finishEvent[1].isBest, true);
	assert.ok(storage.getItem('mitzvahWorld.courseBest.meadow-dash') !== null);
	// A slower second run does not overwrite the best.
	const engine2 = dashEngine(storage);
	const player2 = fakePlayer();
	engine2.activate(player2);
	const best = engine2.bestMs;
	assert.ok(best !== null && best > 9000);
});

test('falling below killY respawns at the last checkpoint', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	place(player, 0, 1.0, 3049);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.checkpointIndex, 1);
	place(player, 0, -20, 3060); // fell into the void
	const start = Date.now();
	engine.afterPlayerFrame(player, 1 / 60);
	const elapsed = Date.now() - start;
	assert.ok(elapsed < 250, `respawn took ${elapsed}ms, budget is 250ms`);
	assert.equal(player.z, 3049);
	assert.equal(player.y, 1.0);
	assert.equal(engine.respawnCount, 1);
});

test('sweeper hazard knocks the player back to the checkpoint', () => {
	const engine = new CourseEngine(courseDefinitionById('canopy-climb'), { storage: fakeStorage() });
	const player = fakePlayer();
	const events = [];
	engine.onEvent = (type, data) => events.push([type, data]);
	engine.activate(player);
	// Stand on the checkpoint-1 platform where sweeper S1's arm passes at t=0.
	place(player, 1200, 3.0, 3016);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.ok(events.some(([type]) => type === 'hazard'), 'hazard event emitted');
	// Checkpoint 1 was touched on the way in, so respawn returns there with
	// invulnerability instead of the spawn pad.
	assert.equal(player.z, 3015);
	assert.equal(player.y, 3.0);
	assert.ok(player.courseInvulnUntil > 0);
	assert.equal(engine.respawnCount, 1);
});

test('coins are collected within the pickup radius', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	assert.equal(engine.coinsCollected, 0);
	place(player, 0, 0.8, 3005); // under the first coin at y 1.6
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.coinsCollected, 1);
	// Same coin cannot be collected twice.
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(engine.coinsCollected, 1);
});

test('ground receipt never snaps a player up through a platform from below', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	// Under the ice platform (top 1.0) at feet 0: no support.
	const below = engine.groundReceipt(0, 3039, 0, 0);
	assert.equal(below, null);
	// Falling onto it from above: supported.
	const falling = engine.groundReceipt(0, 3039, 5, 5);
	assert.ok(falling && Math.abs(falling.height - 1.0) < 1e-9);
	assert.equal(falling.profileId, 'ice');
	// Outside the region: the course has no say.
	assert.equal(engine.groundReceipt(0, 0, 0, 0), null);
});

test('standing on the ferry mover carries the player (river-gap)', () => {
	const engine = new CourseEngine(courseDefinitionById('river-gap'), { storage: fakeStorage() });
	const player = fakePlayer();
	engine.activate(player);
	place(player, 600, 0, 3014); // on ferry-z at t=0
	for (let i = 0; i < 60; i++) {
		engine.beforePlayerFrame(player, 1 / 60);
		engine.afterPlayerFrame(player, 1 / 60);
	}
	// Mover at t=1: z = 3014 + 4*sin(2π/4.5) ≈ 3017.94; the rider follows.
	assert.ok(Math.abs(player.z - 3017.94) < 0.1, `player z=${player.z}`);
	// Ground receipt reports the mover top beneath the rider.
	const receipt = engine.groundReceipt(player.x, player.z, player.y, player.y);
	assert.ok(receipt && receipt.kind === 'course-mover');
	assert.equal(receipt.profileId, 'wood');
});

test('ice sets slippery friction on the player', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	place(player, 0, 1.0, 3039); // on the ice patch
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.ok(player.courseFriction, 'friction set');
	assert.ok(Math.abs(player.courseFriction.decelScale - 0.12) < 1e-9);
	assert.equal(engine.lastGroundSurface, 'ice');
	// Off the course region, friction clears.
	place(player, 0, 0, 2970);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	assert.equal(player.courseFriction, null);
});

test('restart returns the run to spawn with a fresh clock', () => {
	const engine = dashEngine();
	const player = fakePlayer();
	engine.activate(player);
	place(player, 0, 1.0, 3049);
	engine.beforePlayerFrame(player, 1 / 60);
	engine.afterPlayerFrame(player, 1 / 60);
	for (let i = 0; i < 60; i++) engine.beforePlayerFrame(player, 1 / 60);
	engine.restart(player);
	assert.equal(player.z, 2994);
	assert.equal(engine.courseTime, 0);
	assert.equal(engine.checkpointIndex, 0);
	assert.equal(engine.running, true);
});
