// B"H
// Boruch Hashem
// Blessed is He

import { createDefaultGameState } from '../../js/data/database.js';
import { campaignRecipes } from '../../js/data/items/campaign_recipes.js';
import { craftItem, getCraftingPayload } from '../../js/workers/crafting.js';
import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const state = createDefaultGameState();
state.player.level = 100;
state.db.quests = {
	craft_test: {
		id: 'craft_test',
		title: 'Craft Durable Ink',
		objectives: [{
			id: 'durable_ink',
			type: 'craft_item',
			targetId: 'durable_ink',
			required: 1,
			text: 'Craft Durable Ink'
		}]
	}
};

for (const recipe of campaignRecipes) {
	assert(state.db.items[recipe.result], `${recipe.id} produces missing item ${recipe.result}.`);
	for (const ingredient of recipe.ingredients) {
		assert(state.db.items[ingredient.itemId], `${recipe.id} consumes missing item ${ingredient.itemId}.`);
	}
}

assert(Quests.accept(state, 'craft_test'), 'Craft quest could not be accepted.');
const recipe = campaignRecipes.find(entry => entry.result === 'durable_ink');
for (const ingredient of recipe.ingredients) {
	for (let count = 0; count < ingredient.count; count += 1) {
		state.player.inventory.push({ ...state.db.items[ingredient.itemId] });
	}
}
const before = state.player.inventory.length;
const notices = [];
assert(craftItem(state, recipe.id, (message, type) => notices.push({ message, type })), 'Crafting with exact materials failed.');
assert(state.player.inventory.filter(item => item.id === 'durable_ink').length === 1, 'Crafted item was not granted.');
const consumed = recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.count, 0);
assert(state.player.inventory.length === before - consumed + 1, 'Ingredients were not consumed exactly.');
assert(Quests.getStatus(state, 'craft_test') === 'ready', 'Craft objective did not progress.');
const inventoryAfterSuccess = JSON.stringify(state.player.inventory);
assert(!craftItem(state, recipe.id, () => {}), 'Crafting without materials should fail.');
assert(JSON.stringify(state.player.inventory) === inventoryAfterSuccess, 'Failed craft mutated inventory.');
const payload = getCraftingPayload(state);
assert(payload.recipes.some(entry => entry.id === recipe.id && !entry.canCraft), 'Crafting payload did not reflect missing materials.');

console.log(JSON.stringify({
	ok: true,
	campaignRecipes: campaignRecipes.length,
	notices: notices.length,
	finalInventory: state.player.inventory.length
}, null, 2));
