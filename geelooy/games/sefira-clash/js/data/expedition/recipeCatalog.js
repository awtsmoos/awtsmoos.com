//B"H
//Boruch Hashem
//Blessed is He

/**
 * Recipes are named, deterministic transformations with explicit material and Peruta
 * costs. The Awtsmoos renews every act of making; Awtsmoos.com forbids random affixes,
 * destructive durability, hidden odds, and partial consumption before validation.
 */

export const EXPEDITION_RECIPES = Object.freeze([
	recipe('craft-cedar-edge', 'Cedar Edge', 'cedar-edge', 18, 2, {
		'cedar-heartwood': 3,
		'crown-stone': 1
	}),
	recipe('craft-foundation-boots', 'Foundation Boots', 'foundation-boots', 28, 3, {
		'lunar-brass': 3,
		'silver-reed': 2
	}),
	recipe('craft-echo-mantle', 'Echo Mantle', 'echo-mantle', 34, 4, {
		'mirror-glass': 2,
		'silver-reed': 2
	}),
	recipe('craft-mirror-blade', 'Mirror Blade', 'mirror-blade', 42, 5, {
		'mirror-glass': 3,
		'lunar-brass': 2
	}),
	recipe('craft-causeway-spear', 'Causeway Spear', 'causeway-spear', 52, 6, {
		'causeway-steel': 3,
		'cedar-heartwood': 2
	}),
	recipe('craft-victory-boots', 'Victory Boots', 'victory-boots', 56, 7, {
		'causeway-steel': 2,
		'silver-reed': 2
	}),
	recipe('craft-harmony-mail', 'Harmony Mail', 'harmony-mail', 68, 8, {
		'heart-crystal': 2,
		'causeway-steel': 2
	}),
	recipe('craft-heart-relic', 'Heart Prism', 'heart-relic', 74, 9, {
		'heart-crystal': 3,
		'mirror-glass': 1
	}),
	recipe('craft-gevurah-axe', 'Foundry Axe', 'gevurah-axe', 88, 10, {
		'ironwood-core': 3,
		'causeway-steel': 2
	}),
	recipe('craft-iron-cuirass', 'Ironwood Cuirass', 'iron-cuirass', 96, 11, {
		'ironwood-core': 4,
		'heart-crystal': 1
	}),
	recipe('craft-river-mantle', 'River Mantle', 'river-mantle', 110, 12, {
		'riverlight-thread': 3,
		'heart-crystal': 1
	}),
	recipe('craft-binah-plate', 'Plate of Forms', 'binah-plate', 128, 14, {
		'form-plate': 3,
		'ironwood-core': 2
	}),
	recipe('craft-storm-gauntlet', 'Storm Gauntlet', 'storm-gauntlet', 146, 16, {
		'storm-crystal': 3,
		'form-plate': 1
	}),
	recipe('craft-crown-armor', 'Armor of the Crown Road', 'crown-armor', 180, 18, {
		'crown-ember': 3,
		'form-plate': 2
	}),
	recipe('craft-unity-relic', 'Relic of Unity', 'unity-relic', 240, 22, {
		'crown-ember': 3,
		'storm-crystal': 2,
		'heart-crystal': 2
	})
]);

export function expeditionRecipe(recipeId) {
	return EXPEDITION_RECIPES.find(item => item.id === recipeId) || null;
}

function recipe(id, name, gearId, fee, reputation, materials) {
	return Object.freeze({
		id,
		name,
		gearId,
		fee,
		reputation,
		materials: Object.freeze({ ...materials })
	});
}
