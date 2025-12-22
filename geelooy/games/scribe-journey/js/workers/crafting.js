
// B"H
// js/workers/crafting.js
import { recipes } from '../data/items/crafting.js';
import * as Quests from './quests.js';

export function getCraftingPayload(state) {
    return {
        recipes: recipes.map(recipe => {
            const resultItem = state.db.items[recipe.result];
            const canCraft = recipe.ingredients.every(ing => {
                const has = state.player.inventory.filter(i => i.id === ing.itemId).length;
                return has >= ing.count;
            });
            
            return {
                id: recipe.id,
                name: resultItem.name,
                description: resultItem.desc,
                ingredients: recipe.ingredients.map(ing => {
                    const ingItem = state.db.items[ing.itemId];
                    const count = state.player.inventory.filter(i => i.id === ing.itemId).length;
                    return { name: ingItem.name, needed: ing.count, has: count };
                }),
                canCraft: canCraft
            };
        })
    };
}

export function craftItem(state, recipeId, sendToast) {
    const recipe = recipes.find(r => r.id === recipeId);
    if(!recipe) return;

    // Verify ingredients again
    const canCraft = recipe.ingredients.every(ing => {
        const has = state.player.inventory.filter(i => i.id === ing.itemId).length;
        return has >= ing.count;
    });

    if(!canCraft) {
        sendToast("Not enough sparks (ingredients) to perform Tikkun!", "error");
        return;
    }

    // Consume ingredients
    recipe.ingredients.forEach(ing => {
        for(let i=0; i<ing.count; i++) {
            const idx = state.player.inventory.findIndex(item => item.id === ing.itemId);
            if(idx > -1) state.player.inventory.splice(idx, 1);
        }
    });

    // Give Result
    Quests.giveItem(state, recipe.result);
    sendToast(`Crafted ${state.db.items[recipe.result].name}!`, "success");
}
