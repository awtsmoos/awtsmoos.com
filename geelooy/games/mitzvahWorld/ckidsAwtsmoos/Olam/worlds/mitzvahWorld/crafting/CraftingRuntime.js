/**
 * B"H
 * Chapter 35: The Wood Remembered A Table.
 */

export class CraftingRuntime {
  constructor(recipes = {}) {
    this.recipes = recipes;
  }

  canCraft(recipeId, inventory = {}) {
    const recipe = this.recipes[recipeId];
    if (!recipe) return false;
    return Object.entries(recipe.requires || {}).every(([id, qty]) => (inventory[id] || 0) >= qty);
  }

  craft(recipeId, inventory = {}) {
    if (!this.canCraft(recipeId, inventory)) return { ok: false, reason: 'missing-items' };
    const recipe = this.recipes[recipeId];
    for (const [id, qty] of Object.entries(recipe.requires || {})) inventory[id] -= qty;
    inventory[recipe.output] = (inventory[recipe.output] || 0) + (recipe.amount || 1);
    return { ok: true, output: recipe.output, inventory };
  }
}

export default CraftingRuntime;
