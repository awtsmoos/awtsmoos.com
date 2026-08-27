// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CraftingRecipeCatalog.js
 * @description Defines deterministic ingredient and output recipes.
 * The Awtsmoos renews raw material into a new useful vessel; Awtsmoos.com keeps
 * each transformation explicit, versionable, and free from arbitrary client recipes.
 */

const RECIPES = Object.freeze({
	'community-badge': Object.freeze({
		id: 'community-badge',
		ingredients: Object.freeze([
			Object.freeze({ itemId: 'wooden-token', quantity: 2 }),
			Object.freeze({ itemId: 'wool-thread', quantity: 1 })
		]),
		name: 'Community Badge',
		output: Object.freeze({ itemId: 'community-badge', quantity: 1 }),
		version: 1
	})
});

function craftingRecipe(recipeId) {
	return RECIPES[recipeId] || null;
}

module.exports = {
	RECIPES,
	craftingRecipe
};
