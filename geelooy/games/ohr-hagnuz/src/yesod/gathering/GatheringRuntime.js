/**
 * B"H
 * @module GatheringRuntime
 * @description Repeatable gathering loops that feed skills, crafting, and item identity.
 */
import { State } from '../../binah/State.js';
import { addItem } from '../bag/BagRuntime.js';
import { createItemInstance } from '../items/ItemInstanceRuntime.js';
import { ResourceNodeIndex } from '../../data/gathering/ResourceNodeIndex.js';

export const ensureGathering = () => {
  State.Gathering ||= { harvests: {}, resources: {}, xp: {}, history: [] };
  State.Gathering.harvests ||= {};
  State.Gathering.resources ||= {};
  State.Gathering.xp ||= {};
  State.Gathering.history ||= [];
  return State.Gathering;
};

export const harvestNode = id => {
  const node = ResourceNodeIndex[id];
  if (!node) return { ok: false, reason: 'unknown-node' };
  const state = ensureGathering();
  const amount = node.amount || 1;
  state.harvests[id] = (state.harvests[id] || 0) + 1;
  state.resources[node.item] = (state.resources[node.item] || 0) + amount;
  state.xp[node.skill] = (state.xp[node.skill] || 0) + (node.xp || 1);
  if (node.instance) createItemInstance(node.item, { source: `gather:${id}`, rarity: 'common' });
  else addItem(node.item, amount);
  state.history.unshift({ id, item: node.item, amount, at: new Date().toISOString() });
  state.history = state.history.slice(0, 30);
  return { ok: true, node, amount, total: state.resources[node.item] };
};

export const gatheringRows = () => Object.entries(ensureGathering().resources).map(([id, amount]) => [id, amount]);
