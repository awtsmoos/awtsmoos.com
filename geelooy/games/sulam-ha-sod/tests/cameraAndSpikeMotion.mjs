// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { CameraRig } from '../js/core/cameraRig.js';
import { SpikeOracle } from '../js/systems/spikes.js';

/**
 * Camera and moving spike regression.
 *
 * The Awtsmoos lets the player climb into the upper adventure, and the eye must
 * follow. The same chamber now has rolling, cycling, orbiting, and patrolling
 * spikes; they must move predictably and remain testable.
 */
function testCameraFollowsDeepSky() {
  const rig = new CameraRig();
  const level = LEVELS[2];
  const world = {
    width: level.width,
    level,
    player: { x: 600, y: 420, w: 34, h: 48 },
    cameraResetAfterDeath: false
  };
  const view = { width: 390, height: 844 };
  rig.update(world, view);
  world.player.y = -210;
  const high = rig.update(world, view);
  assert.ok(high.y < -360, 'camera should follow above the old -360 clamp');
  assert.ok(high.y > -900, 'camera should not drift into infinite empty sky');
}

function testSpikeMotionFamilies() {
  const spikes = new SpikeOracle([
    { x: 100, y: 100, w: 30, h: 30, cycle: true, showDormant: true, moveX: 70, period: 2, duty: 1, moveRate: 3 },
    { x: 220, y: 100, w: 30, h: 30, cycle: true, showDormant: true, rollSpeed: 120, minX: 200, maxX: 260, period: 2, duty: 1 },
    { x: 400, y: 100, w: 30, h: 30, cycle: true, showDormant: true, orbitR: 40, orbitX: 400, orbitY: 100, orbitRate: 2, period: 2, duty: 1 }
  ], { next: () => 0 });
  const before = spikes.traps.map(trap => ({ x: trap.x, y: trap.y }));
  for (let i = 0; i < 20; i += 1) spikes.step(1 / 30, { x: 0, y: 0, w: 34, h: 48 });
  assert.notEqual(spikes.traps[0].x, before[0].x, 'patrol spike should move horizontally');
  assert.notEqual(spikes.traps[1].x, before[1].x, 'rolling spike should move');
  assert.notDeepEqual({ x: spikes.traps[2].x, y: spikes.traps[2].y }, before[2], 'orbiting spike should move both axes');
  assert.equal(spikes.active().length, 3, 'cycle spikes should expose active collision while duty is on');
}

function testEveryLevelHasMotionHazards() {
  for (const level of LEVELS) {
    const motion = (level.spikes || []).filter(spike => spike.moveX || spike.moveY || spike.rollSpeed || spike.orbitR || spike.cycle);
    assert.ok(motion.length >= 4, `${level.name} should have several moving/cyclic spike hazards`);
  }
}

testCameraFollowsDeepSky();
testSpikeMotionFamilies();
testEveryLevelHasMotionHazards();
console.log('Sulam HaSod camera and spike motion regression ok');
