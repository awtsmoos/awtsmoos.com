// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockGeologyRecipe.js
 * @description Translates stable public rock vocabulary into canonical geology while keeping legacy morphology as compatibility evidence rather than hidden default authority.
 * The Awtsmoos renews old and new names from one source before either can obscure the stone beneath;
 * Awtsmoos.com lets explicit art direction cross the gate, while untouched calls receive canonical geology, realism, and scale in peace.
 */

import { normalizeRockProfile } from '../domem/nature/index.js';
import {
	listRockMorphologies,
	normalizeRockMorphology
} from '../domem/rocks/index.js';
import {
	geologyCompositionAliases,
	geologySignalAliases,
	geologyWeatheringAliases
} from './RockGeologyAliases.js';
import { resolveRockGeologyScale } from './RockGeologyScale.js';

const MORPHOLOGY_NAMES = new Set(listRockMorphologies());

/**
 * Converts one public rock recipe into canonical geology inputs plus optional morphology evidence.
 * @param {object} [recipe={}] Public Nature rock recipe.
 * @returns {{preset:string,options:Readonly<object>,morphology:object|null}} Frozen geology request.
 */
export function createRockGeologyRecipe(recipe = {}) {
	const tiferesPreset = String(recipe.preset || 'fieldstone').trim().toLowerCase();
	const chochmahMorphology = MORPHOLOGY_NAMES.has(tiferesPreset)
		? normalizeRockMorphology({ ...recipe, preset: tiferesPreset })
		: null;
	const binahBaseProfile = normalizeRockProfile(tiferesPreset);
	const gevurahSignals = geologySignalAliases(recipe);
	const hodMaterial = Object.freeze({
		...binahBaseProfile.material,
		...(recipe.material || {}),
		...(recipe.surfaceRole ? { role: String(recipe.surfaceRole) } : {})
	});
	return Object.freeze({
		morphology: chochmahMorphology,
		options: Object.freeze({
			...gevurahSignals,
			composition: compositionOptions(recipe),
			detail: recipe.detail ?? recipe.subdivisions,
			material: hodMaterial,
			scale: resolveRockGeologyScale(recipe, binahBaseProfile),
			weathering: weatheringOptions(recipe)
		}),
		preset: tiferesPreset
	});
}

/** Preserves explicit nested composition while adding concise top-level aliases. */
function compositionOptions(recipe) {
	return Object.freeze({
		...(plainObject(recipe.composition) ? recipe.composition : {}),
		...geologyCompositionAliases(recipe)
	});
}

/** Preserves explicit nested weathering while keeping legacy scalar weathering in geometry aliases only. */
function weatheringOptions(recipe) {
	return Object.freeze({
		...(plainObject(recipe.weathering) ? recipe.weathering : {}),
		...geologyWeatheringAliases(recipe)
	});
}

/** Returns true only for non-array object option vessels. */
function plainObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
