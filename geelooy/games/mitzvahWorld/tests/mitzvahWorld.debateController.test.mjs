// B"H
/**
 * Chapter 18: The Debate Actually Turns.
 *
 * This test imports the real TorahDebateController and makes a fake player
 * receive real rewards after PaRDeS actions defeat claims.
 */

import assert from 'node:assert/strict';
import { TorahDebateController } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/debate/TorahDebateController.js';
import { resolveDebateType } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/debate/TorahDebateRules.js';

assert.equal(resolveDebateType('pshat', 'sod'), 'strong');
assert.equal(resolveDebateType('remez', 'sod'), 'weak');
assert.equal(resolveDebateType('derush', 'sod'), 'neutral');
assert.equal(resolveDebateType('sod', 'remez'), 'strong');

const received = [];
const player = {
  xp: 0,
  gainXp(amount) { this.xp += amount; },
  inventory: { addItem(item, quantity) { received.push({ item, quantity }); } }
};

const debate = new TorahDebateController();
let state = debate.open('chumash_bereishis_opening', player);
assert.equal(state.deckId, 'chumash_bereishis_opening');

state = debate.selectPassage('bereishis_1_1');
assert.equal(state.selectedPassageId, 'bereishis_1_1');

debate.playPirush('pshat');
debate.playPirush('remez');
debate.playPirush('derush');
debate.playPirush('sod');
state = debate.playPirush('sod');

assert.equal(state.completed, true);
assert.equal(player.xp, 180);
assert.ok(received.some(entry => entry.item.id === 'passage_shemos_20_2'));
assert.equal(debate.close().completed, true);
assert.equal(debate.snapshot(), null);

console.log('B"H - Torah debate controller runtime passed.');
