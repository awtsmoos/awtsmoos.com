/**
 * B"H
 * @module GiftRuntime
 * @description Gather, give, count, and summarize the gifts of the house.
 */
import { State } from '../../binah/State.js';
import { giftById, orderedGifts } from '../../data/rambam/GiftLawIndex.js';
import { recipientByGlyph, recipientById } from '../../data/rambam/RecipientIndex.js';
import { produceByGlyph } from '../../data/rambam/ProduceIndex.js';
import { canGiveGift } from './OrderValidator.js';
import { refreshDeclaration } from './DeclarationRuntime.js';

const bumpCounter = key => {
  State.Quests ||= { active: {}, completed: {}, counters: {} };
  State.Quests.counters ||= {};
  State.Quests.counters[key] = (State.Quests.counters[key] || 0) + 1;
};

export const ensureGiftLedger = () => {
  State.Gifts ||= { inventory: {}, given: {}, blessingRemembered: false, joyShared: false, declaration: { unlocked: [], total: 6 }, history: [] };
  State.Gifts.inventory ||= {};
  State.Gifts.given ||= {};
  State.Gifts.history ||= [];
  return State.Gifts;
};

export const collectGift = giftId => {
  const gift = giftById(giftId);
  if (!gift) return false;
  const ledger = ensureGiftLedger();
  ledger.inventory[giftId] = (ledger.inventory[giftId] || 0) + 1;
  ledger.history.unshift(`Collected ${gift.name}.`);
  bumpCounter(giftId);
  State.say(`${gift.name} entered the house. Give it to ${gift.receiver}.`, 360);
  return true;
};

export const collectGiftByGlyph = glyph => {
  const produce = produceByGlyph(glyph);
  return produce ? collectGift(produce.id) : false;
};

export const giveGift = (giftId, receiverId) => {
  const gift = giftById(giftId);
  const receiver = recipientById(receiverId);
  const ledger = ensureGiftLedger();
  if (!gift || !receiver) return { ok: false, message: 'Unknown gift or receiver.' };
  if ((ledger.inventory[giftId] || 0) <= 0) return { ok: false, message: `You do not carry ${gift.name}.` };
  const check = canGiveGift(giftId, receiverId, ledger);
  if (!check.ok) return { ok: false, message: check.reason };
  ledger.inventory[giftId] -= 1;
  ledger.given[giftId] = (ledger.given[giftId] || 0) + 1;
  ledger.history.unshift(`Gave ${gift.name} to ${receiver.name}.`);
  if (gift.counter) bumpCounter(gift.counter);
  if (giftId === 'maaser_ani') ledger.joyShared = true;
  if (giftId === 'terumah') ledger.blessingRemembered = true;
  const lines = refreshDeclaration();
  State.say(`${receiver.name} received ${gift.name}. Declaration lines unlocked: ${lines.unlocked.length}.`, 520);
  return { ok: true, message: `${gift.name} given.`, lines };
};

export const giveBestGiftToReceiverGlyph = glyph => {
  const receiver = recipientByGlyph(glyph);
  if (!receiver) return false;
  const ledger = ensureGiftLedger();
  const candidates = orderedGifts().filter(g => g.receiver === receiver.id || (g.id === 'maaser_sheni' && receiver.id === 'sea_fire'));
  const owned = candidates.find(g => (ledger.inventory[g.id] || 0) > 0);
  const result = owned ? giveGift(owned.id, receiver.id) : { ok: false, message: `${receiver.name}: bring the proper gift first.` };
  State.say(result.message, 420);
  return true;
};

export const giftRows = () => {
  const ledger = ensureGiftLedger();
  return orderedGifts().map(gift => [gift.name, `house ${ledger.inventory[gift.id] || 0} / given ${ledger.given[gift.id] || 0}`]);
};
