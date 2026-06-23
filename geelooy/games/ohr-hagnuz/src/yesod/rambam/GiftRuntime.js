/**
 * B"H
 * @module GiftRuntime
 * @description Runtime for collecting, carrying, restoring, and narrating the five gifts.
 *
 * Chapter 307: A gift touched its address and the whole map exhaled. The
 * Awtsmoos creates the world from nothing every instant, yet this runtime
 * remembers which entrusted holiness is still trapped in the house, which
 * receiver was restored, what skill grew, and what the player must do next.
 */
import { State } from '../../binah/State.js';
import { giftById, orderedGifts, GiftOrder } from '../../data/rambam/GiftLawIndex.js';
import { recipientByGlyph, recipientById } from '../../data/rambam/RecipientIndex.js';
import { produceByGlyph } from '../../data/rambam/ProduceIndex.js';
import { canGiveGift } from './OrderValidator.js';
import { refreshDeclaration } from './DeclarationRuntime.js';
import { grantGiftSkills, grantActionSkill } from '../skills/SkillRuntime.js';

const names = { terumah: 'Terumah', maaser_rishon: 'Maaser Rishon', maaser_ani: 'Maaser Ani', maaser_sheni: 'Maaser Sheni', bikkurim: 'Bikkurim' };

const bumpCounter = key => {
  State.Quests ||= { active: {}, completed: {}, counters: {} };
  State.Quests.counters ||= {};
  State.Quests.counters[key] = (State.Quests.counters[key] || 0) + 1;
};

export const ensureGiftLedger = () => {
  State.Gifts ||= { inventory: {}, given: {}, history: [], mistakes: [], declaration: { unlocked: [], total: 6, blockedBy: [] } };
  State.Gifts.inventory ||= {};
  State.Gifts.given ||= {};
  State.Gifts.history ||= [];
  State.Gifts.mistakes ||= [];
  State.Gifts.declaration ||= { unlocked: [], total: 6, blockedBy: [] };
  refreshGiftBlockers();
  return State.Gifts;
};

export const collectGift = giftId => {
  const gift = giftById(giftId);
  if (!gift) return false;
  const ledger = ensureGiftLedger();
  ledger.inventory[giftId] = (ledger.inventory[giftId] || 0) + 1;
  syncGiftModel(giftId, 'held', 1);
  ledger.history.unshift(`Collected ${gift.name} in ${gift.chain?.region || 'the world'}.`);
  bumpCounter(giftId);
  grantActionSkill('inspect', 4);
  setObjective(`Carry ${gift.name} to ${gift.receiver}.`, gift.chain?.region || State.Story.region);
  State.say(`${gift.name} entered the house. Receiver: ${gift.receiver}.`, 420);
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
  if (!gift || !receiver) return fail('Unknown gift or receiver.', giftId, receiverId);
  if ((ledger.inventory[giftId] || 0) <= 0) return fail(`You do not carry ${gift.name}.`, giftId, receiverId);
  const check = canGiveGift(giftId, receiverId, ledger);
  if (!check.ok) return fail(check.reason, giftId, receiverId);

  ledger.inventory[giftId] -= 1;
  ledger.given[giftId] = (ledger.given[giftId] || 0) + 1;
  syncGiftModel(giftId, 'held', -1);
  syncGiftModel(giftId, 'given', 1);
  ledger.history.unshift(`Restored ${gift.name} to ${receiver.name}.`);
  if (gift.counter) bumpCounter(gift.counter);
  if (giftId === 'maaser_ani') ledger.joyShared = true;
  if (giftId === 'terumah') ledger.blessingRemembered = true;
  grantGiftSkills(giftId);
  const lines = refreshDeclaration();
  refreshGiftBlockers();
  updateStoryAfterGift(giftId);
  State.say(`${receiver.name} received ${gift.name}. ${nextGiftText()}`, 620);
  return { ok: true, message: `${gift.name} restored to ${receiver.name}.`, lines };
};

const fail = (message, giftId, receiverId) => {
  const ledger = ensureGiftLedger();
  ledger.mistakes.unshift({ giftId, receiverId, message, at: Date.now() });
  grantActionSkill('restore', 2);
  State.say(message, 460);
  return { ok: false, message };
};

const syncGiftModel = (giftId, key, delta) => {
  const model = State.Gifts?.ledger?.[giftId];
  if (model) model[key] = Math.max(0, (model[key] || 0) + delta);
};

const refreshGiftBlockers = () => {
  const ledger = State.Gifts;
  const missing = GiftOrder.filter(id => !(ledger.given?.[id] > 0)).map(id => names[id] || id);
  ledger.declaration.blockedBy = missing;
  ledger.declaration.ready = missing.length === 0 && (ledger.declaration.unlocked?.length || 0) >= Math.min(5, ledger.declaration.total || 6);
  return missing;
};

const updateStoryAfterGift = giftId => {
  const remaining = refreshGiftBlockers();
  const done = 5 - remaining.length;
  State.Story.act = done < 3 ? 2 : done < 5 ? 3 : Math.max(State.Story.act || 1, 4);
  State.Story.active = done < 5 ? 'Court of Rightful Receivers' : 'Merchant of Exchange';
  State.Story.region = done < 5 ? 'Court of Rightful Receivers' : 'Market of Exchange';
  State.Story.objective = done < 5 ? `Restore the next gift: ${remaining[0]}.` : 'Challenge the Merchant of Exchange: gifts are not prices.';
  State.Story.nextStep = nextGiftText();
  State.Inventory.journal.notes.unshift(`Gift restored: ${names[giftId] || giftId}. Remaining: ${remaining.join(', ') || 'none'}.`);
};

const setObjective = (objective, region) => {
  State.Story.objective = objective;
  State.Story.region = region || State.Story.region;
  State.Story.nextStep = nextGiftText();
};

const nextGiftText = () => {
  const missing = refreshGiftBlockers();
  return missing.length ? `Next restoration: ${missing[0]}.` : 'All five gifts restored. Face the Merchant, then the House of Forgetting.';
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
