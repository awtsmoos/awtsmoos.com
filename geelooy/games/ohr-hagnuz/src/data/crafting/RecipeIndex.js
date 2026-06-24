/** B"H @module RecipeIndex - simple repeatable crafting recipes. */
export const RecipeIndex = {
  warm_tea: { name: 'Warm Tea', consumes: { fig: 1 }, produces: { tea: 1 }, xp: 7, skill: 'Cooking' },
  scribe_ink: { name: 'Scribe Ink', consumes: { scroll: 1, spark: 1 }, produces: { ink: 1 }, xp: 8, skill: 'Scribing' },
  luminous_token: { name: 'Luminous Token', consumes: { SPARK_STONE: 1 }, instance: 'SPARK_STONE', rarity: 'uncommon', xp: 12, skill: 'Crafting' }
};
export const allRecipes = () => Object.entries(RecipeIndex).map(([id, recipe]) => ({ id, ...recipe }));
