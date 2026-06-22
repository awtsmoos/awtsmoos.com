/**
 * B"H
 * @module OrderValidator
 * @description Validates that holy gifts are given as giving, not selling, in the story order.
 */
import { GiftLawIndex, GiftOrder, giftById } from '../../data/rambam/GiftLawIndex.js';

export const nextRequiredGift = ledger => GiftOrder.find(id => (ledger?.inventory?.[id] || 0) > 0 && !(ledger?.given?.[id] > 0)) || null;

export const canGiveGift = (giftId, receiverId, ledger = {}) => {
  const gift = giftById(giftId);
  if (!gift) return { ok: false, reason: 'Unknown gift.' };
  if (gift.receiver !== receiverId && !(giftId === 'maaser_sheni' && receiverId === 'sea_fire')) return { ok: false, reason: `${gift.name} belongs to ${gift.receiver}.` };
  const earlier = GiftOrder.filter(id => GiftLawIndex[id].order < gift.order);
  const blocked = earlier.find(id => (ledger.inventory?.[id] || 0) > 0 && !(ledger.given?.[id] > 0));
  if (blocked) return { ok: false, reason: `${gift.name} waits until ${GiftLawIndex[blocked].name} is given.` };
  return { ok: true, reason: `${gift.name} can be given.` };
};

export const declarationCounters = ledger => ({
  terumahGiven: ledger.given?.terumah || 0,
  leviGiven: ledger.given?.maaser_rishon || 0,
  poorGiven: ledger.given?.maaser_ani || 0,
  secondResolved: ledger.given?.maaser_sheni || 0,
  bikkurimGiven: ledger.given?.bikkurim || 0,
  blessingRemembered: ledger.blessingRemembered ? 1 : 0,
  joyShared: ledger.joyShared ? 1 : 0
});
