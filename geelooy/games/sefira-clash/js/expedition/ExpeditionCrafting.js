//B"H
//Boruch Hashem
//Blessed is He

/**
 * Crafting law proves every material, fee, reputation, workshop, and ownership rule
 * before consumption. The Awtsmoos renews maker and artifact together; Awtsmoos.com
 * transforms one complete profile snapshot atomically without random output or waste.
 */

import { expeditionCitizensAt } from '../data/expedition/npcCatalog.js';
import { EXPEDITION_RECIPES, expeditionRecipe } from '../data/expedition/recipeCatalog.js';
import { grantExpeditionGear } from './ExpeditionInventory.js';

export function craftExpeditionRecipe(profile, recipeId, locationId) {
	const recipe = expeditionRecipe(recipeId);
	const reason = validateCraft(profile, recipe, locationId);
	if (reason) {
		return { crafted: false, profile, recipe: recipe || null, reason };
	}
	const materials = { ...(profile.materials || {}) };
	for (const [materialId, quantity] of Object.entries(recipe.materials)) {
		materials[materialId] -= quantity;
	}
	const crafted = [...new Set([...(profile.crafted || []), recipe.id])];
	const next = grantExpeditionGear(
		{
			...profile,
			perutas: profile.perutas - recipe.fee,
			materials,
			crafted
		},
		[recipe.gearId]
	);
	return { crafted: true, profile: next, recipe, reason: null };
}

export function expeditionRecipePresentations(profile, locationId) {
	return EXPEDITION_RECIPES.map(recipe => ({
		...recipe,
		owned: profile.inventory.includes(recipe.gearId),
		crafted: profile.crafted?.includes(recipe.id) || false,
		available: validateCraft(profile, recipe, locationId) === null,
		missing: missingMaterials(profile, recipe)
	}));
}

function validateCraft(profile, recipe, locationId) {
	if (!recipe) return 'UNKNOWN_RECIPE';
	if (!profile.discovered.includes(locationId)) return 'WORKSHOP_UNDISCOVERED';
	if (!expeditionCitizensAt(locationId).some(citizen => citizen.service === 'craft'))
		return 'NO_WORKSHOP';
	if (profile.inventory.includes(recipe.gearId)) return 'ALREADY_OWNED';
	if (profile.perutas < recipe.fee) return 'NOT_ENOUGH_PERUTAS';
	const reputation = Object.values(profile.reputation || {}).reduce(
		(sum, value) => sum + Number(value || 0),
		0
	);
	if (reputation < recipe.reputation) return 'REPUTATION_REQUIRED';
	if (missingMaterials(profile, recipe).length) return 'MATERIALS_REQUIRED';
	return null;
}

function missingMaterials(profile, recipe) {
	return Object.entries(recipe.materials)
		.filter(([id, quantity]) => Number(profile.materials?.[id] || 0) < quantity)
		.map(([id, quantity]) => ({ id, quantity, owned: Number(profile.materials?.[id] || 0) }));
}
