// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { TrickPlatformField } from '../js/systems/trickPlatforms.js';
import { applyTrigger } from '../js/systems/levelTriggers.js';
import { SpikeOracle } from '../js/systems/spikes.js';

/**
 * Level Devil brutality regression.
 *
 * The Awtsmoos makes terror learnable: spikes may become floors, floors may
 * dodge the player's landing, and proximity can birth new spikes from nowhere.
 * This suite proves those brutal ideas exist in every chamber and still obey
 * deterministic, testable mechanics instead of turning into broken noise.
 */
function testEveryLevelHasDevilDeceptions() {
  for (const level of LEVELS) {
    const kinds = new Set((level.trickPlatforms || []).map(t => t.kind));
    assert.ok(kinds.has('safeSpike'), `${level.name} needs a spike-looking platform the player must trust`);
    assert.ok(kinds.has('dodgePlatform'), `${level.name} needs a platform that moves before landing`);
    assert.ok((level.triggers || []).some(t => /invented spikes|woke/.test(t.message || '')), `${level.name} needs proximity surprise spikes`);
  }
}

function testSafeSpikeIsSolidButNotHazard() {
  const field = new TrickPlatformField([{ x: 10, y: 100, w: 90, h: 18, kind: 'safeSpike' }]);
  assert.equal(field.bodies().length, 1, 'safeSpike must be solid');
  assert.equal(field.hazardBodies().length, 0, 'safeSpike must not be a death hazard');
  assert.match(field.land(field.bodies()[0], { x: 0, y: 0, w: 34, h: 48 }), /only floor/);
}

function testDodgePlatformMovesBeforeLanding() {
  const field = new TrickPlatformField([{ x: 100, y: 200, w: 100, h: 18, kind: 'dodgePlatform', slide: 120, range: 160, panicTime: 0.6 }]);
  const before = field.platforms[0].x;
  field.step(1 / 60, { x: 130, y: 120, w: 34, h: 48, vy: 320 });
  field.step(0.2, { x: 130, y: 120, w: 34, h: 48, vy: 320 });
  assert.notEqual(field.platforms[0].x, before, 'dodgePlatform should move away during landing approach');
}

function testTriggeredMovingSpikesKeepMotionState() {
  const world = {
    message: '', currency: {}, level: { platforms: [] }, enemies: [], coins: [], fakeCoins: [], keys: [],
    rotors: { platforms: [] }, tricks: new TrickPlatformField([]), spikes: new SpikeOracle([], { next: () => 0 }),
    trickCoins: { coins: [] }, reindex() {}
  };
  applyTrigger(world, { spikes: [{ x: 20, y: 30, w: 30, h: 30, instant: true, duration: 1, orbitR: 20, orbitX: 20, orbitY: 30, orbitRate: 3 }] });
  const before = { x: world.spikes.traps[0].x, y: world.spikes.traps[0].y };
  world.spikes.step(0.25, { x: 0, y: 0, w: 34, h: 48 });
  assert.notDeepEqual({ x: world.spikes.traps[0].x, y: world.spikes.traps[0].y }, before, 'triggered orbit spike should keep moving');
}

testEveryLevelHasDevilDeceptions();
testSafeSpikeIsSolidButNotHazard();
testDodgePlatformMovesBeforeLanding();
testTriggeredMovingSpikesKeepMotionState();
console.log('Sulam HaSod Level Devil brutality regression ok');
