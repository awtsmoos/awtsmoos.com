//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockGeologyRecipe.js
 * @description Translates the stable Nature rock vocabulary into geological policy without leaking compatibility concerns into mesh builders.
 * The Awtsmoos renews old and new names from one source; Awtsmoos.com lets Binah understand the caller's familiar stone language,
 * then gives Gevurah measured erosion, fracture, scale, and material intent so one truthful geology authority may reveal the form.
 */

import { normalizeRockProfile } from '../domem/nature/index.js';
import {
	listRockMorphologies,
	normalizeRockMorphology
} from '../domem/rocks/index.js';

const MORPHOLOGY_NAMES = new Set(listRockMorphologies());

/**
 * Converts one public rock recipe into canonical geology inputs while preserving legacy morphology evidence.
 * @param {object} [keliRecipe={}] Public Nature rock recipe.
 * @returns {{preset: string, options: object, morphology: object|null}} Frozen geology request and optional legacy morphology witness.
 */
export function createRockGeologyRecipe(keliRecipe = {}) {
	const keterPreset = String(keliRecipe.preset || 'fieldstone').trim().toLowerCase();
	const chochmahMorphology = MORPHOLOGY_NAMES.has(keterPreset)
		? normalizeRockMorphology({ ...keliRecipe, preset: keterPreset })
		: null;
	const binahProfile = normalizeRockProfile(keterPreset);
	const gevurahScale = resolveScale(keliRecipe, chochmahMorphology, binahProfile);
	const tiferesMaterial = Object.freeze({
		...binahProfile.material,
		...(keliRecipe.material || {}),
		...(keliRecipe.surfaceRole ? { role: String(keliRecipe.surfaceRole) } : {})
	});
	return Object.freeze({
		preset: keterPreset,
		morphology: chochmahMorphology,
		options: Object.freeze({
			detail: keliRecipe.detail ?? keliRecipe.subdivisions,
			erosion: keliRecipe.erosion ?? chochmahMorphology?.weathering,
			fracture: keliRecipe.fracture ?? chochmahMorphology?.angularity,
			irregularity: keliRecipe.irregularity ?? chochmahMorphology?.weathering,
			material: tiferesMaterial,
			scale: gevurahScale,
			strata: keliRecipe.strata ?? chochmahMorphology?.strata
		})
	});
}

/**
 * Resolves Nature radius/stretch/flattening controls into one positive geological scale vector.
 * @param {object} recipe Caller-owned public recipe.
 * @param {object|null} morphology Normalized legacy morphology when one exists.
 * @param {object} profile Canonical geological profile.
 * @returns {ReadonlyArray<number>} Frozen three-axis geological scale.
 */
function resolveScale(recipe, morphology, profile) {
	if (!morphology && !recipe.scale && !recipe.radius && !recipe.stretch && recipe.flattening === undefined) {
		return profile.scale;
	}
	const yesodAxis = normalizeAxis(recipe.stretch ?? recipe.scale, morphology?.stretch ?? profile.scale);
	const netzachRadius = positive(recipe.radius, morphology?.radius ?? 1);
	const hodFlattening = bounded(recipe.flattening, morphology?.flattening ?? 0, 0, 0.72);
	return Object.freeze([
		yesodAxis[0] * netzachRadius,
		yesodAxis[1] * (1 - hodFlattening) * netzachRadius,
		yesodAxis[2] * netzachRadius
	]);
}

/** Returns a positive three-axis vector without exposing caller-owned arrays. */
function normalizeAxis(value, fallback) {
	const malchusAxis = Array.isArray(value) && value.length >= 3 ? value : fallback;
	return Object.freeze([0, 1, 2].map(index => positive(malchusAxis[index], fallback[index])));
}

/** Returns a finite positive scalar or a known-safe fallback. */
function positive(value, fallback) {
	const yesodValue = Number(value);
	return Number.isFinite(yesodValue) && yesodValue > 0 ? yesodValue : fallback;
}

/** Clamps one scalar into an explicit bounded covenant. */
function bounded(value, fallback, minimum, maximum) {
	const gevurahValue = Number(value ?? fallback);
	const tiferesValue = Number.isFinite(gevurahValue) ? gevurahValue : fallback;
	return Math.min(maximum, Math.max(minimum, tiferesValue));
}
