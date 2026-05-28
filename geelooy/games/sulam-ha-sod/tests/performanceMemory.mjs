// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { PhysicsWorld } from '../js/core/physics.js';
import { SpatialHash } from '../js/systems/spatialHash.js';
import { RotatingPlatformField } from '../js/systems/rotatingPlatforms.js';
import { TrickPlatformField } from '../js/systems/trickPlatforms.js';

/**
 * Performance and reset-memory regression.
 *
 * The Awtsmoos recreates existence, but Sulam HaSod must not recreate garbage
 * on every frame. These checks guard the reusable broadphase and body caches,
 * and they make reset behavior explicit: normal reset clears death fragments;
 * death pause preserves them only until continue.
 */
function testSpatialHashReusesQueryOutput() {
  const hash = new SpatialHash(100);
  const body = { x: 0, y: 0, w: 80, h: 20 };
  const out = [];
  hash.build([body]);
  const first = hash.queryInto({ x: -5, y: -5, w: 20, h: 20 }, out);
  const second = hash.queryInto({ x: -5, y: -5, w: 20, h: 20 }, out);
  assert.equal(first, out, 'queryInto returns caller-owned output');
  assert.equal(second, out, 'queryInto keeps reusing caller-owned output');
  assert.equal(out.length, 1, 'dedupe still returns one body');
}

function testPlatformBodyCachesStayStable() {
  const rotors = new RotatingPlatformField([{ x: 10, y: 20, w: 80, h: 14, spin: 2 }]);
  const rotorBodies = rotors.bodies();
  const rotorBody = rotorBodies[0];
  rotors.step(1 / 60);
  assert.equal(rotors.bodies(), rotorBodies, 'rotor body array should be stable');
  assert.equal(rotors.bodies()[0], rotorBody, 'rotor body object should be stable');

  const tricks = new TrickPlatformField([{ x: 10, y: 20, w: 80, h: 14, kind: 'oneWay' }]);
  const trickBodies = tricks.bodies();
  const trickBody = trickBodies[0];
  tricks.step(1 / 60, { x: 0, y: 0, w: 34, h: 48, vx: 0, vy: 0 });
  assert.equal(tricks.bodies(), trickBodies, 'trick body array should be stable');
  assert.equal(tricks.bodies()[0], trickBody, 'trick body object should be stable');
}

function testPhysicsBuffersAndDeathMemory() {
  const world = new PhysicsWorld(LEVELS.at(-1));
  const platformBuffer = world.nearPlatforms;
  const enemyBuffer = world.nearEnemies;
  const platformBodies = world.platformBodies;
  for (let i = 0; i < 90; i += 1) world.step({ x: i % 2 ? 1 : -1, jump: false, restart: false, ok: false }, 1 / 60);
  assert.equal(world.nearPlatforms, platformBuffer, 'platform query buffer should be stable');
  assert.equal(world.nearEnemies, enemyBuffer, 'enemy query buffer should be stable');
  assert.equal(world.platformBodies, platformBodies, 'platform broadphase list should be stable');

  world.loseMoneyAndReset('Perf test death.');
  assert.ok(world.deathPause, 'death reset preserves pause state');
  assert.ok(world.deathBursts.length >= 1, 'death reset preserves visible shatter');
  world.deathPause.t = 99;
  world.deathPause.ready = true;
  assert.equal(world.continueAfterDeath(), true, 'continue should exit death pause');
  assert.equal(world.deathBursts.length, 0, 'continue clears death fragments');
  world.deathBursts.push({ life: 1, particles: [{ life: 1 }] });
  world.load(world.sourceLevel);
  assert.equal(world.deathBursts.length, 0, 'normal reset clears stale fragments');
}

testSpatialHashReusesQueryOutput();
testPlatformBodyCachesStayStable();
testPhysicsBuffersAndDeathMemory();
console.log('Sulam HaSod performance-memory regression ok');
