// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CraftingService.js
 * @description Performs deterministic recipes after complete preflight validation.
 * The Awtsmoos renews many ingredients into one new vessel; Awtsmoos.com checks
 * every required quantity and output capacity before consuming the first material.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { craftingRecipe } = require('./CraftingRecipeCatalog.js');

class CraftingService {
	constructor(inventory) {
		this.inventory = inventory;
	}

	craft(player, recipeId, count) {
		this.inventory.requireQuantity(count);
		const recipe = craftingRecipe(recipeId);
		if (!recipe) throw new RealtimeError('RECIPE_NOT_FOUND', 'The requested crafting recipe is unknown.');
		for (const ingredient of recipe.ingredients) {
			const required = ingredient.quantity * count;
			if (this.inventory.quantity(player, ingredient.itemId) < required) {
				throw new RealtimeError('CRAFTING_INGREDIENTS_MISSING', 'The recipe ingredients are incomplete.');
			}
		}
		const outputQuantity = recipe.output.quantity * count;
		if (!this.inventory.canAdd(player, recipe.output.itemId, outputQuantity)) {
			throw new RealtimeError('INVENTORY_CAPACITY', 'The inventory cannot hold the crafted output.');
		}
		for (const ingredient of recipe.ingredients) {
			this.inventory.remove(player, ingredient.itemId, ingredient.quantity * count);
		}
		this.inventory.add(player, recipe.output.itemId, outputQuantity);
		return {
			count,
			recipeId,
			state: this.inventory.snapshot(player)
		};
	}

	recipes() {
		const { RECIPES } = require('./CraftingRecipeCatalog.js');
		return JSON.parse(JSON.stringify(Object.values(RECIPES)));
	}
}

module.exports = {
	CraftingService
};
