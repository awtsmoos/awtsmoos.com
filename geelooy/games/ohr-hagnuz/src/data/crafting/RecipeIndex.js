/** B"H @module RecipeIndex - repeatable recipes used by missions and free play. */
export const RecipeIndex = {
	clean_wick: {
		name: 'Clean Lamp Wick',
		consumes: { scroll: 2 },
		produces: { wick: 1 },
		xp: 9,
		skill: 'Scribing',
		description: 'Twisted from gathered reeds for a steady communal flame.'
	},
	warm_tea: {
		name: 'Warm Tea',
		consumes: { fig: 1 },
		produces: { tea: 1 },
		xp: 7,
		skill: 'Cooking',
		description: 'A small restoration brewed from orchard fruit.'
	},
	scribe_ink: {
		name: 'Scribe Ink',
		consumes: { scroll: 1, spark: 1 },
		produces: { ink: 1 },
		xp: 8,
		skill: 'Scribing',
		description: 'Ink whose source remains visible in every letter.'
	},
	luminous_token: {
		name: 'Luminous Token',
		consumes: { SPARK_STONE: 1 },
		instance: 'SPARK_STONE',
		rarity: 'uncommon',
		xp: 12,
		skill: 'Crafting',
		description: 'A durable vessel cut from a hidden spark stone.'
	}
};

export const allRecipes = () => Object.entries(RecipeIndex).map(([id, recipe]) => ({ id, ...recipe }));
