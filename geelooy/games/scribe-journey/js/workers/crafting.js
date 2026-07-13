// B"H
// Boruch Hashem
// Blessed is He

import { recipes } from '../data/items/crafting.js';
import * as Quests from './quests.js';

function inventoryCount(state, itemId) {
	return state.player.inventory.filter(item => item.id === itemId).length;
}

function canCraftRecipe(state, recipe) {
	return recipe.ingredients.every(ingredient => inventoryCount(state, ingredient.itemId) >= ingredient.count);
}

function ingredientPayload(state, ingredient) {
	const definition = state.db.items[ingredient.itemId];
	return {
		name: definition?.name || ingredient.itemId,
		needed: ingredient.count,
		has: inventoryCount(state, ingredient.itemId)
	};
}

/** Shows material truth before the player spends a single spark. */
export function getCraftingPayload(state) {
	return {
		recipes: recipes.map(recipe => {
			const result = state.db.items[recipe.result];
			return {
				id: recipe.id,
				name: result?.name || recipe.result,
				description: result?.desc || '',
				ingredients: recipe.ingredients.map(ingredient => ingredientPayload(state, ingredient)),
				canCraft: canCraftRecipe(state, recipe)
			};
		})
	};
}

function consumeIngredients(state, recipe) {
	for (const ingredient of recipe.ingredients) {
		for (let count = 0; count < ingredient.count; count += 1) {
			const index = state.player.inventory.findIndex(item => item.id === ingredient.itemId);
			if (index >= 0) state.player.inventory.splice(index, 1);
		}
	}
}

/** Consumes exact ingredients, grants the result, and emits one craft fact. */
export function craftItem(state, recipeId, sendToast) {
	const recipe = recipes.find(entry => entry.id === recipeId);
	if (!recipe) {
		sendToast('That recipe is not written in the Chronicle.', 'error');
		return false;
	}
	if (!canCraftRecipe(state, recipe)) {
		sendToast('Not enough sparks to perform this Tikkun.', 'error');
		return false;
	}
	consumeIngredients(state, recipe);
	Quests.giveItem(state, recipe.result, 1, null);
	Quests.emit(state, {
		type: 'craft_item',
		targetId: recipe.result,
		recipeId: recipe.id,
		quantity: 1,
		mapId: state.currentMapId
	}, sendToast);
	sendToast(`Crafted ${state.db.items[recipe.result]?.name || recipe.result}!`, 'success');
	return true;
}
