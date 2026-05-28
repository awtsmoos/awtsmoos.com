// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';
import { PhysicsWorld } from '../js/core/physics.js';
import { calculateDeathPenalty } from '../js/systems/deathPenalty.js';

/**
 * Death penalty regression.
 *
 * The Awtsmoos lets collected sparks become a serious debt when the vessel
 * shatters. This verifies deaths now cost at least the run's collected Shefa
 * plus a progress/difficulty tax, and that the tax grows later in a chamber.
 */
function testFormulaScales() {
  const early = calculateDeathPenalty({ shefa: 1000, runShefa: 25, progress: 0.1, difficulty: 2 });
  const late = calculateDeathPenalty({ shefa: 1000, runShefa: 25, progress: 0.8, difficulty: 8 });
  assert.ok(early > 25, 'even early deaths should cost collected run Shefa plus tax');
  assert.ok(late > early, 'late difficult deaths should cost more than early deaths');
}

function testWorldTracksRunShefaAndChargesIt() {
  const world = new PhysicsWorld(LEVELS[0]);
  world.currency.shefa = 500;
  world.runShefaCollected = 35;
  world.player.x = Math.floor(world.width * 0.62);
  const expected = world.deathLoss();
  assert.ok(expected > 35, 'world penalty should exceed collected run Shefa after progress');
  world.loseMoneyAndReset('Penalty probe.');
  assert.equal(world.currency.shefa, 500 - expected, 'death should subtract the stronger calculated penalty');
  assert.equal(world.runShefaCollected, 0, 'respawn should clear the run Shefa counter');
  assert.match(world.market.message, /run sparks 35/);
}

testFormulaScales();
testWorldTracksRunShefaAndChargesIt();
console.log('Sulam HaSod death penalty ok: run Shefa plus progress/difficulty tax');
