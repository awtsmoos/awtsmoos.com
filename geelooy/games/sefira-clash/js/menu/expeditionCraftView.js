//B"H
//Boruch Hashem
//Blessed is He

/**
 * Craft view names every deterministic recipe, fee, reputation requirement, and
 * missing material before one resource is consumed. The Awtsmoos renews workshop and
 * artifact together; Awtsmoos.com exposes atomic making without random affixes or waste.
 */

import { expeditionGear } from '../data/expedition/gearCatalog.js';
import { expeditionMaterial } from '../data/expedition/materialCatalog.js';

export function expeditionCraftSection(snapshot, onCraft) {
	const recipes = snapshot.recipes.filter(recipe => !recipe.owned || recipe.crafted);
	if (!snapshot.citizens.some(citizen => citizen.service === 'craft')) return null;
	return {
		tag: 'section',
		attrs: { class: 'expeditionCrafting' },
		children: [
			{ tag: 'h3', children: ['Workshop Recipes'] },
			{
				tag: 'div',
				attrs: { class: 'expeditionRecipeGrid' },
				children: recipes.map(recipe => recipeCard(recipe, onCraft))
			}
		]
	};
}

function recipeCard(recipe, onCraft) {
	const gear = expeditionGear(recipe.gearId);
	return {
		tag: 'article',
		attrs: { class: `expeditionRecipe ${recipe.available ? 'available' : 'locked'}` },
		children: [
			{ tag: 'h4', children: [recipe.name] },
			{ tag: 'p', children: [gear?.description || 'Authored Expedition equipment.'] },
			{ tag: 'small', children: [`Fee ◈ ${recipe.fee} · reputation ${recipe.reputation}`] },
			{ tag: 'ul', children: materialLines(recipe) },
			{
				tag: 'button',
				attrs: { type: 'button', disabled: recipe.available ? null : true },
				on: { click: () => onCraft(recipe.id) },
				children: [
					recipe.owned
						? 'Owned'
						: recipe.available
							? 'Craft Gear'
							: 'Requirements Missing'
				]
			}
		]
	};
}

function materialLines(recipe) {
	return Object.entries(recipe.materials).map(([materialId, required]) => {
		const missing = recipe.missing.find(item => item.id === materialId);
		const owned = missing ? missing.owned : required;
		const material = expeditionMaterial(materialId);
		return { tag: 'li', children: [`${material?.name || materialId}: ${owned}/${required}`] };
	});
}
