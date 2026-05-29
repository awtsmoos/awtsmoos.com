// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { SpikeOracle } from '../js/systems/spikes.js';
import { TrickPlatformField } from '../js/systems/trickPlatforms.js';

/**
 * Chapter 17: The Awtsmoos rewrote the devil's contract.
 *
 * Safe spikes may be bridges, bait platforms may dodge, and proximity teeth may
 * wake near the player. But they may not become damage before warning. This
 * suite preserves the devil mechanics while forbidding unfair instant murder.
 */
function testSafeSpikeAndBaitShiftBehavior() {
  const field = new TrickPlatformField([
    { x: 100, y: 100, w: 90, h: 18, kind: 'safeSpike' },
    { x: 240, y: 100, w: 100, h: 18, kind: 'baitShift', shiftX: 120, range: 200, reset: 1.2, returnAt: 0.4 }
  ]);
  const player = { x: 238, y: 34, w: 34, h: 48, vx: 0, vy: 120 };
  assert.equal(field.bodies().some(p => p.kind === 'safeSpike'), true, 'safeSpike must be solid');
  assert.equal(field.hazardBodies().some(p => p.kind === 'safeSpike'), false, 'safeSpike must not be lethal');
  assert.match(field.land(field.bodies().find(p => p.kind === 'safeSpike'), player), /honest bridge/);
  const bait = field.platforms.find(p => p.kind === 'baitShift');
  const before = bait.x;
  for (let i = 0; i < 10; i += 1) field.step(1 / 30, player);
  assert.ok(Math.abs(bait.x - before) > 6, 'baitShift should move when the player commits near it');
}

function testProximitySpikesWarnBeforeDamage() {
  const oracle = new SpikeOracle([{ x: 100, y: 100, w: 40, h: 24, proximity: true, range: 80, instant: true, duration: 0.8 }], { next: () => 0 });
  assert.equal(oracle.active().length, 0, 'proximity spike begins inactive');
  oracle.step(1 / 60, { x: 96, y: 88, w: 34, h: 48 });
  assert.equal(oracle.active().length, 0, 'proximity spike must not damage instantly');
  assert.equal(oracle.warning().length, 1, 'proximity spike must warn first');
  for (let i = 0; i < 70; i += 1) oracle.step(1 / 60, { x: 96, y: 88, w: 34, h: 48 });
  assert.equal(oracle.active().length, 1, 'proximity spike activates after warning');
}

function testEveryLevelReceivesDevilLayer() {
  for (const level of LEVELS) {
    const kinds = new Set((level.trickPlatforms || []).map(platform => platform.kind));
    assert.ok(kinds.has('safeSpike'), `${level.name} needs required safe-spike bridges`);
    assert.ok(kinds.has('baitShift'), `${level.name} needs a dodging memorization platform`);
    assert.ok((level.spikes || []).some(spike => spike.proximity), `${level.name} needs proximity surprise spikes`);
  }
}

testSafeSpikeAndBaitShiftBehavior();
testProximitySpikesWarnBeforeDamage();
testEveryLevelReceivesDevilLayer();
console.log('Sulam HaSod devil mechanics regression ok');
