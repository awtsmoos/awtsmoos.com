/** B"H - Merchant and House systems */
import assert from 'node:assert/strict';
import { acceptMerchantOffer, refuseMerchantOffer, repairMerchantOffer, merchantBattleReady } from '../../src/yesod/rambam/MerchantRuntime.js';
import { collectGift, giveGift, ensureGiftLedger } from '../../src/yesod/rambam/GiftRuntime.js';
import { roomAvailable, clearForgettingRoom, houseCleared } from '../../src/yesod/rambam/ForgettingRuntime.js';
import { State } from '../../src/binah/State.js';

assert.equal(refuseMerchantOffer('sell_terumah').ok, true, 'can refuse offer');
assert.equal(acceptMerchantOffer('discount_poor').ok, true, 'can accept offer');
assert.equal(State.Merchant.corruption, 1, 'corruption increments');
assert.equal(repairMerchantOffer('discount_poor').ok, true, 'can repair offer');
assert.equal(State.Merchant.corruption, 0, 'corruption repairs');

ensureGiftLedger();
for (const id of ['terumah','maaser_rishon','maaser_ani','maaser_sheni','bikkurim']) collectGift(id);
giveGift('terumah', 'kohen');
giveGift('maaser_rishon', 'levi');
giveGift('maaser_ani', 'poor');
giveGift('maaser_sheni', 'jerusalem');
giveGift('bikkurim', 'jerusalem');
assert.equal(merchantBattleReady(), true, 'merchant battle ready after gifts');
assert.equal(roomAvailable('flavor'), true, 'flavor room available after bikkurim');
for (const id of ['blessings','teachers','students','gifts','joy','flavor']) assert.equal(clearForgettingRoom(id).ok, true, `clear ${id}`);
assert.equal(houseCleared(), true, 'house clears');
console.log('BH_MERCHANT_HOUSE_TEST_PASS');
