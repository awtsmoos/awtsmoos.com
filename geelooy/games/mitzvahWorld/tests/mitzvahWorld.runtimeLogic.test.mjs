// B"H
/**
 * Chapter 16: The Logic Walks By Itself.
 *
 * These tests import runtime modules and execute their core paths: debate turn
 * resolution, rewards, mobile tap, desktop key, and action bar dispatch.
 */

import assert from 'node:assert/strict';
import { TorahDebateController } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/debate/TorahDebateController.js';
import { ResponsiveActionDispatcher } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/mobile/ResponsiveActionDispatcher.js';

const player = {
  xp: 0,
  items: [],
  gainXp(amount) { this.xp += amount; },
  inventory: {
    addItem(item, qty) { player.items.push({ item, qty }); }
  }
};

const debate = new TorahDebateController();
let state = debate.open('chumash_bereishis_opening', player);
assert.equal(state.completed, false);
state = debate.selectPassage('bereishis_1_1');
assert.equal(state.selectedPassageId, 'bereishis_1_1');

while (!state.completed) {
  state = debate.playPirush('pshat');
}

assert.equal(state.completed, true);
assert.equal(player.xp, 180);
assert.equal(player.items.some(entry => entry.item.id === 'passage_shemos_20_2'), true);
assert.equal(debate.close().completed, true);

const dispatcher = new ResponsiveActionDispatcher();
assert.deepEqual(dispatcher.normalize({ type: 'tap' }, { width: 390, hasTouch: true }), { device: 'mobile', action: 'activate' });
assert.deepEqual(dispatcher.normalize({ code: 'KeyE' }, { width: 1200, hasTouch: false }), { device: 'desktop', action: 'activate' });
assert.deepEqual(dispatcher.normalize({ code: 'Digit2' }, { width: 1200, hasTouch: false }), { device: 'desktop', action: 'actionBar', slot: 1 });

let activated = false;
let slot = null;
dispatcher.dispatch({ type: 'tap' }, { activate() { activated = true; } }, { width: 390, hasTouch: true });
dispatcher.dispatch({ code: 'Digit3' }, { activateActionSlot(index) { slot = index; } }, { width: 1200 });
assert.equal(activated, true);
assert.equal(slot, 2);

console.log('B"H - runtime logic tests passed.');
