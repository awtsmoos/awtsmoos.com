/**
 * B"H
 * @module CraftingRuntime
 * @description Consumes gathered resources, creates items, and advances missions.
 */
import { State } from '../../binah/State.js';
import { RecipeIndex, allRecipes } from '../../data/crafting/RecipeIndex.js';
import { recordMissionEvent } from '../../missions/MissionRuntime.js';
import { addItem, ensureBag } from '../bag/BagRuntime.js';
import { createItemInstance } from '../items/ItemInstanceRuntime.js';

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
	State.Gathering.resources ||= {};
	const gathered = Math.min(State.Gathering.resources[id] || 0, amount);
	State.Gathering.resources[id] = (State.Gathering.resources[id] || 0) - gathered;
	const bagAmount = amount - gathered;
	if (bagAmount) State.Inventory.items[id] = (State.Inventory.items[id] || 0) - bagAmount;
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
	if (check.recipe.instance) {
		createItemInstance(check.recipe.instance, { rarity: check.recipe.rarity || 'common', source: `craft:${id}` });
	}
	state.crafted[id] = (state.crafted[id] || 0) + 1;
	state.xp[check.recipe.skill] = (state.xp[check.recipe.skill] || 0) + (check.recipe.xp || 1);
	state.history.unshift({ id, at: new Date().toISOString() });
	state.history = state.history.slice(0, 30);
	recordMissionEvent('CRAFT', id, { amount: 1, mapId: State.MapId });
	State.say(`Crafted ${check.recipe.name}. ${check.recipe.description || ''}`, 360);
	return { ok: true, recipe: check.recipe, count: state.crafted[id] };
};

export const craftingRows = () => allRecipes().map(recipe => ({
	...recipe,
	canCraft: canCraft(recipe.id).ok,
	crafted: ensureCrafting().crafted[recipe.id] || 0
}));
