/**
 * B"H
 * @module MerchantRuntime
 * @description Merchant of Exchange temptation and refusal runtime.
 *
 * Chapter 313: The antagonist became a system. The Awtsmoos creates value from
 * nothing every instant, but the Merchant says value is only price. This runtime
 * lets the player refuse, accept, suffer consequence, and repair the lie.
 */
import { State } from '../../binah/State.js';
import { merchantOfferById, allMerchantOffers } from '../../data/rambam/MerchantExchangeIndex.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';

export const ensureMerchantState = () => {
  State.Merchant ||= { refused: [], accepted: [], repaired: [], corruption: 0, lastOffer: null };
  return State.Merchant;
};

export const merchantOffers = () => allMerchantOffers();

export const refuseMerchantOffer = id => {
  const offer = merchantOfferById(id);
  if (!offer) return { ok: false, message: 'Unknown offer.' };
  const state = ensureMerchantState();
  if (!state.refused.includes(id)) state.refused.push(id);
  state.lastOffer = id;
  grantSkillExp('Debate', 10, `refused ${offer.title}`);
  grantSkillExp('Declaration', 6, 'gift is not price');
  State.say(`Refused: ${offer.title}. Gift defeated transaction.`, 520);
  return { ok: true, message: `Refused ${offer.title}.`, offer };
};

export const acceptMerchantOffer = id => {
  const offer = merchantOfferById(id);
  if (!offer) return { ok: false, message: 'Unknown offer.' };
  const state = ensureMerchantState();
  if (!state.accepted.includes(id)) state.accepted.push(id);
  state.corruption += 1;
  state.lastOffer = id;
  applyGain(offer.gain || {});
  State.Gifts ||= { mistakes: [] };
  State.Gifts.mistakes ||= [];
  State.Gifts.mistakes.unshift({ giftId: offer.cost?.gift || null, receiverId: 'merchant', message: offer.consequence, at: Date.now() });
  State.say(`Accepted bargain: ${offer.consequence}`, 620);
  return { ok: true, message: offer.consequence, offer };
};

export const repairMerchantOffer = id => {
  const offer = merchantOfferById(id);
  if (!offer) return { ok: false, message: 'Unknown offer.' };
  const state = ensureMerchantState();
  if (!state.repaired.includes(id)) state.repaired.push(id);
  state.corruption = Math.max(0, state.corruption - 1);
  grantSkillExp('Restoration', 12, `repaired ${offer.title}`);
  State.say(`Repaired bargain: ${offer.repair}`, 620);
  return { ok: true, message: offer.repair, offer };
};

const applyGain = gain => {
  State.Inventory ||= { money: 0, items: {}, journal: { notes: [] } };
  if (gain.money) State.Inventory.money = (State.Inventory.money || 0) + gain.money;
  if (gain.light) State.Stats.light = Math.min(State.Stats.maxLight || 100, (State.Stats.light || 0) + gain.light);
  if (gain.level) State.Stats.level = (State.Stats.level || 1) + gain.level;
};

export const merchantBattleReady = () => {
  const state = ensureMerchantState();
  return state.refused.length >= 3 || (State.Gifts?.declaration?.blockedBy || []).length === 0;
};
