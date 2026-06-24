/**
 * B"H
 * @module CraftingRuntime
 * @description Recipes that consume gathered resources and produce useful loops.
 */
import { State } from '../../binah/State.js';
import { addItem, ensureBag } from '../bag/BagRuntime.js';
import { createItemInstance } from '../items/ItemInstanceRuntime.js';
import { RecipeIndex } from '../../data/crafting/RecipeIndex.js';

export const ensureCrafting = () => {
  State.Crafting ||= { crafted: {}, xp: {}, history: [] };
  State.Crafting.crafted ||= {};
  State.Crafting.xp ||= {};
  State.Crafting.history ||= [];
  return State.Crafting;
};

const available = id => (State.Gathering?.resources?.[id] || 0) + (ensureBag().items?.[id] || 0);
const consume = (id, amount) => {
  State.Gathering ||= { resources: {} };
  const fromGather = Math.min(State.Gathering.resources[id] || 0, amount);
  State.Gathering.resources[id] = (State.Gathering.resources[id] || 0) - fromGather;
  const rest = amount - fromGather;
  if (rest) State.Inventory.items[id] = (State.Inventory.items[id] || 0) - rest;
};

export const canCraft = id => {
  const recipe = RecipeIndex[id];
  if (!recipe) return { ok: false, reason: 'unknown-recipe' };
  const missing = Object.entries(recipe.consumes || {}).filter(([item, amount]) => available(item) < amount);
  return missing.length ? { ok: false, reason: 'missing-materials', missing } : { ok: true, recipe };
};

export const craftRecipe = id => {
  const check = canCraft(id);
  if (!check.ok) return check;
  const state = ensureCrafting();
  Object.entries(check.recipe.consumes || {}).forEach(([item, amount]) => consume(item, amount));
  Object.entries(check.recipe.produces || {}).forEach(([item, amount]) => addItem(item, amount));
  if (check.recipe.instance) createItemInstance(check.recipe.instance, { rarity: check.recipe.rarity || 'common', source: `craft:${id}` });
  state.crafted[id] = (state.crafted[id] || 0) + 1;
  state.xp[check.recipe.skill] = (state.xp[check.recipe.skill] || 0) + (check.recipe.xp || 1);
  state.history.unshift({ id, at: new Date().toISOString() });
  state.history = state.history.slice(0, 30);
  return { ok: true, recipe: check.recipe, count: state.crafted[id] };
};
