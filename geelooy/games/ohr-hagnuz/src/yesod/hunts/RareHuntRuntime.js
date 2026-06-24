/** B"H @module RareHuntRuntime - rare spawn and boss hunt loops. */
import { State } from '../../binah/State.js';
import { RareHuntIndex } from '../../data/hunts/RareHuntIndex.js';
import { createItemInstance } from '../items/ItemInstanceRuntime.js';
import { addReputation } from '../reputation/ReputationRuntime.js';

export const ensureRareHunts = () => {
  State.RareHunts ||= { attempts: {}, defeats: {}, history: [] };
  State.RareHunts.attempts ||= {};
  State.RareHunts.defeats ||= {};
  State.RareHunts.history ||= [];
  return State.RareHunts;
};

export const spawnHunt = id => {
  const hunt = RareHuntIndex[id];
  if (!hunt) return { ok: false, reason: 'unknown-hunt' };
  const state = ensureRareHunts();
  state.attempts[id] = (state.attempts[id] || 0) + 1;
  state.history.unshift({ type: 'spawn', id, at: new Date().toISOString() });
  return { ok: true, hunt, phase: hunt.phases[0], attempt: state.attempts[id] };
};

export const defeatHunt = id => {
  const hunt = RareHuntIndex[id];
  if (!hunt) return { ok: false, reason: 'unknown-hunt' };
  const state = ensureRareHunts();
  state.defeats[id] = (state.defeats[id] || 0) + 1;
  const drop = createItemInstance(hunt.reward, { rarity: hunt.rarity, source: `hunt:${id}` });
  if (hunt.reputation) addReputation(hunt.reputation, hunt.rarity === 'legendary' ? 25 : 10, `hunt:${id}`);
  state.history.unshift({ type: 'defeat', id, drop: drop.item?.id, at: new Date().toISOString() });
  state.history = state.history.slice(0, 40);
  return { ok: true, hunt, defeats: state.defeats[id], drop: drop.item };
};

export const huntRows = () => Object.entries(ensureRareHunts().defeats).map(([id, count]) => [id, count]);
