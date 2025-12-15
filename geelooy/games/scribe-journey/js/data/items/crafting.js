
// B"H
// js/data/items/crafting.js

import { cookingRecipes } from '../recipes/cooking.js';
import { scribingRecipes } from '../recipes/scribing.js';
import { smithingRecipes } from '../recipes/smithing.js';

const miscRecipes = [
    {
        id: 'craft_potion_1',
        result: 'elixir_of_clarity',
        ingredients: [{itemId: 'manna_dew', count: 3}, {itemId: 'ink_of_potential', count: 1}]
    },
    {
        id: 'craft_revive',
        result: 'sparks_of_holiness',
        ingredients: [{itemId: 'ink_of_potential', count: 2}, {itemId: 'living_ember', count: 1}]
    },
    {
        id: 'craft_maamar_binding',
        result: 'maamar_5715',
        ingredients: [{itemId: 'ink_of_creation', count: 5}, {itemId: 'coin_of_nature', count: 1}]
    },
    {
        id: 'craft_maccabee_hammer',
        result: 'hammer_maccabee',
        ingredients: [
            {itemId: 'idol_fragment_1', count: 1}, // The First Idol
            {itemId: 'idol_fragment_8', count: 1}, // The Eighth Day
            {itemId: 'idol_fragment_36', count: 1}, // The 36 Lights
            {itemId: 'jug_of_pure_oil', count: 1}  // The Pure Oil
        ]
    }
];

export const recipes = [
    ...miscRecipes,
    ...cookingRecipes,
    ...scribingRecipes,
    ...smithingRecipes
];
