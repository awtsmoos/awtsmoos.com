/**
 * B"H
 * @file rambamGiftRuntimeSmoke.mjs
 */
const assert = (condition, message) => { if (!condition) throw new Error(message); };
globalThis.window = { AwtsmoosIntents: { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 } };
const { State } = await import('../binah/State.js');
const { collectGift, giveGift, giftRows } = await import('../yesod/rambam/GiftRuntime.js');
State.Gifts = { inventory: {}, given: {}, blessingRemembered: false, joyShared: false, declaration: { unlocked: [], total: 6 }, history: [] };
State.Quests = { active: {}, completed: {}, counters: {} };
collectGift('terumah');
collectGift('maaser_rishon');
collectGift('maaser_ani');
collectGift('maaser_sheni');
collectGift('bikkurim');
assert(State.Gifts.inventory.terumah === 1, 'terumah not collected');
assert(giveGift('maaser_rishon', 'levi').ok === false, 'order validator allowed levi before terumah');
assert(giveGift('terumah', 'kohen').ok, 'terumah not given');
assert(giveGift('maaser_rishon', 'levi').ok, 'levi gift not given');
assert(giveGift('maaser_ani', 'poor').ok, 'poor gift not given');
assert(giveGift('maaser_sheni', 'jerusalem').ok, 'second tithe not resolved');
assert(giveGift('bikkurim', 'jerusalem').ok, 'bikkurim not given');
assert(State.Gifts.blessingRemembered === true, 'blessing flag missing');
assert(State.Gifts.joyShared === true, 'joy flag missing');
assert(State.Quests.counters.terumahGiven === 1, 'quest counter missing');
console.log(JSON.stringify({ ok: true, rows: giftRows(), counters: State.Quests.counters }, null, 2));
