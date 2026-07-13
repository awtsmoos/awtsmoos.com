// B"H
// Boruch Hashem
// Blessed is He

import { campaignRecipes } from './campaign_recipes.js';

const legacyRecipes = [
	{ id: 'weave_reinforced_tzitzit', result: 'reinforced_tzitzit', ingredients: [{ itemId: 'tzitzit_thread', count: 2 }, { itemId: 'wool_scrap', count: 3 }] },
	{ id: 'craft_magen_david', result: 'magen_david', ingredients: [{ itemId: 'silver_piece', count: 5 }, { itemId: 'spark_of_chokhmah', count: 1 }] },
	{ id: 'brew_healing_potion', result: 'healing_potion', ingredients: [{ itemId: 'healing_herb', count: 3 }, { itemId: 'water_flask', count: 1 }] },
	{ id: 'prepare_challah', result: 'challah', ingredients: [{ itemId: 'flour_sack', count: 2 }, { itemId: 'water_flask', count: 1 }] },
	{ id: 'craft_wooden_plank', result: 'wooden_plank', ingredients: [{ itemId: 'wood_log', count: 1 }] },
	{ id: 'craft_stone_block', result: 'stone_block', ingredients: [{ itemId: 'stone_chunk', count: 2 }] },
	{ id: 'craft_oil_lamp', result: 'oil_lamp', ingredients: [{ itemId: 'clay_lump', count: 1 }, { itemId: 'olive_oil', count: 1 }] },
	{ id: 'craft_glass_vial', result: 'glass_vial', ingredients: [{ itemId: 'sand_pile', count: 3 }, { itemId: 'fire_essence', count: 1 }] },
	{ id: 'craft_copper_wire', result: 'copper_wire', ingredients: [{ itemId: 'copper_ore', count: 2 }] },
	{ id: 'craft_iron_ingot', result: 'iron_ingot', ingredients: [{ itemId: 'iron_ore', count: 3 }] },
	{ id: 'craft_silver_ingot', result: 'silver_ingot', ingredients: [{ itemId: 'silver_ore', count: 3 }] },
	{ id: 'craft_gold_ingot', result: 'gold_ingot', ingredients: [{ itemId: 'gold_ore', count: 3 }] },
	{ id: 'craft_parchment', result: 'parchment', ingredients: [{ itemId: 'animal_hide', count: 1 }, { itemId: 'salt', count: 1 }] },
	{ id: 'craft_black_ink', result: 'black_ink', ingredients: [{ itemId: 'soot', count: 2 }, { itemId: 'tree_sap', count: 1 }] },
	{ id: 'craft_quill_pen', result: 'quill_pen', ingredients: [{ itemId: 'bird_feather', count: 1 }] },
	{ id: 'craft_leather_strap', result: 'leather_strap', ingredients: [{ itemId: 'animal_hide', count: 2 }] },
	{ id: 'craft_prayer_book', result: 'prayer_book', ingredients: [{ itemId: 'parchment', count: 5 }, { itemId: 'black_ink', count: 2 }, { itemId: 'leather_strap', count: 1 }] },
	{ id: 'craft_shofar', result: 'shofar', ingredients: [{ itemId: 'ram_horn', count: 1 }, { itemId: 'polishing_stone', count: 1 }] },
	{ id: 'craft_kiddush_cup', result: 'kiddush_cup', ingredients: [{ itemId: 'silver_ingot', count: 2 }] },
	{ id: 'craft_shabbat_candles', result: 'shabbat_candles', ingredients: [{ itemId: 'beeswax', count: 2 }, { itemId: 'cotton_wick', count: 2 }] }
];

/** Legacy and campaign recipes share one immutable registry. */
export const recipes = Object.freeze([...legacyRecipes, ...campaignRecipes]);
