// B"H
import assert from 'node:assert/strict';
import { LEVELS } from '../js/data/levels.js';

/**
 * Late expansion regression.
 *
 * The Awtsmoos has added five teeth, then six, then seven more black-rainbow
 * chambers. This file keeps the late staircase honest: every new chamber must
 * be authored, enormous, brutal, and still readable through repeated memory.
 */
function testLateExpansionBlocks() {
  assert.equal(LEVELS.length, 51, 'campaign should now contain fifty-one chambers');
  const firstFive = LEVELS.slice(33, 38);
  const secondSix = LEVELS.slice(38, 44);
  const finalSeven = LEVELS.slice(44, 51);
  assert.equal(firstFive.length, 5, 'levels 34-38 should remain');
  assert.equal(secondSix.length, 6, 'levels 39-44 should remain');
  assert.equal(finalSeven.length, 7, 'levels 45-51 should exist');
  for (const title of ['Blue Fire', 'Bone Rain', 'River of Latches', 'Cinder Shofar', 'Ash Mazal', 'Emerald Noose', 'Black Rainbow']) assert.ok(finalSeven.some(level => level.name.includes(title)), `missing ${title}`);
}

function testLateLevelsAreBrutalButStructured() {
  for (const level of LEVELS.slice(33)) {
    assert.ok(level.width >= 19000, `${level.name} should be enormous`);
    assert.ok((level.trickPlatforms || []).filter(p => p.kind === 'baitShift').length >= 2, `${level.name} needs multiple dodging platforms`);
    assert.ok((level.trickPlatforms || []).filter(p => p.kind === 'safeSpike').length >= 2, `${level.name} needs multiple safe spike bridges`);
    assert.ok((level.spikes || []).some(spike => spike.proximity), `${level.name} needs close surprise spikes`);
    assert.ok((level.enemies || []).filter(enemy => enemy.dropCoin).length >= 3, `${level.name} needs several enemy-held required coins`);
    assert.ok((level.triggers || []).some(trigger => (trigger.spikes || []).length >= 3), `${level.name} needs falling spike curtains`);
    assert.ok((level.trickCoins || []).length >= 4, `${level.name} needs trick coin memory`);
    assert.ok((level.triggers || []).some(trigger => trigger.openExit), `${level.name} needs an authored exit-opening trigger`);
  }
}

testLateExpansionBlocks();
testLateLevelsAreBrutalButStructured();
console.log('Sulam HaSod late expansion regression ok: 51 chambers');
