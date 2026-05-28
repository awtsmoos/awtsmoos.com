// B"H
import assert from 'node:assert/strict';
import { PhysicsWorld } from '../js/core/physics.js';
import { TrickPlatformField } from '../js/systems/trickPlatforms.js';

/**
 * One-way platform regression.
 *
 * The Awtsmoos makes a rung that is not a wall. From below, it is a whisper the
 * player rises through. From above, it becomes a hand beneath the falling feet.
 * These tests lock the deception into deterministic physics instead of vibes.
 */
const level = {
  name: '00 · One Way Test Chamber',
  width: 900,
  spawn: { x: 90, y: 40 },
  door: { x: 800, y: 80, w: 44, h: 90 },
  law: 'Only falling vessels are caught.',
  platforms: [],
  rotatingPlatforms: [],
  trickPlatforms: [{ x: 100, y: 100, w: 140, h: 14, kind: 'oneWay' }],
  coins: [],
  keys: [],
  spikes: [],
  enemies: [],
  triggers: []
};

function testRisingThroughOneWay() {
  const world = new PhysicsWorld(level);
  Object.assign(world.player, { x: 120, y: 90, vx: 0, vy: -220, on: false });
  world.previousPlayerY = 120;
  world.resolve('y');
  assert.equal(world.player.y, 90, 'rising through one-way should not collide');
  assert.equal(world.player.on, false, 'rising through one-way should not set on-ground');
}

function testLandingOnOneWay() {
  const world = new PhysicsWorld(level);
  Object.assign(world.player, { x: 120, y: 80, vx: 0, vy: 240, on: false });
  world.previousPlayerY = 40;
  world.resolve('y');
  assert.equal(world.player.y, 52, 'falling from above should land on one-way');
  assert.equal(world.player.on, true, 'landing on one-way should set on-ground');
}

function testOneWayIsSolidButSpecial() {
  const field = new TrickPlatformField(level.trickPlatforms);
  const bodies = field.bodies();
  assert.equal(bodies.length, 1, 'one-way rung is present in solid broadphase');
  assert.equal(bodies[0].warn, 'oneWay', 'one-way rung carries its warning kind');
  assert.match(field.land(bodies[0], { vx: 0, vy: 0 }), /falling vessel/);
}

testRisingThroughOneWay();
testLandingOnOneWay();
testOneWayIsSolidButSpecial();
console.log('Sulam HaSod one-way platform regression ok');
