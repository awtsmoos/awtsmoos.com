/**
 * B"H
 * @test Rambam RPG restoration loop
 */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { collectGift, giveGift, ensureGiftLedger } from '../../src/yesod/rambam/GiftRuntime.js';
import { clearForgettingRoom, houseCleared } from '../../src/yesod/rambam/ForgettingRuntime.js';
import { recordMusag } from '../../src/yesod/musag/MusagDex.js';
import { attemptFinalDeclaration } from '../../src/yesod/rambam/FinalDeclarationRuntime.js';
import { skillSummary } from '../../src/yesod/skills/SkillRuntime.js';

const gifts = ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim'];
const receivers = ['kohen', 'levi', 'poor', 'jerusalem', 'jerusalem'];
const rooms = ['blessings', 'teachers', 'students', 'gifts', 'joy', 'flavor'];

ensureGiftLedger();
for (const id of gifts) assert.equal(collectGift(id), true, `collect ${id}`);
for (let i = 0; i < gifts.length; i += 1) {
  const result = giveGift(gifts[i], receivers[i]);
  assert.equal(result.ok, true, `give ${gifts[i]} to ${receivers[i]}`);
}

const early = attemptFinalDeclaration();
assert.equal(early.ok, false, 'final declaration blocked before House of Forgetting clears');
assert.ok(early.report.houseMissing.length > 0, 'missing house rooms reported');

for (const id of rooms) assert.equal(clearForgettingRoom(id).ok, true, `clear room ${id}`);
assert.equal(houseCleared(), true, 'house cleared');

recordMusag({ name: 'Wild Musag: Helem', lesson: 'concealment asks to be sweetened' }, true);
recordMusag({ name: 'Wild Musag: Helem', lesson: 'concealment asks again' }, true);
recordMusag({ name: 'Wild Musag: Helem', lesson: 'concealment evolves' }, true);

const declaration = attemptFinalDeclaration();
assert.equal(declaration.ok, true, 'final declaration ready after gifts and house');
assert.equal(State.Gifts.declaration.ready, true, 'state declaration ready');
assert.equal(State.MusagDex.seenCount >= 1, true, 'musag seen count updates');
assert.equal(State.MusagDex.sweetenedCount >= 3, true, 'musag sweetened count updates');
assert.ok(State.MusagDex.evolutions.helem, 'helem evolution recorded');
assert.ok(skillSummary().some(skill => skill.level >= 1 && skill.xp >= 0), 'skills summarize');
assert.equal(State.Story.active, 'Ohr HaGnuz Revealed', 'story ending active');

console.log('BH_RAMBAM_RPG_LOOP_TEST_PASS');
