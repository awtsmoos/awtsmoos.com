//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RockGeologyRecipe.js
 * @description Translates stable Nature rock vocabulary into geometry, weathering, composition, and material policy without leaking compatibility into specialists.
 * The Awtsmoos renews old and new names from one source; Awtsmoos.com lets familiar stone language enter one gate,
 * then Binah reveals fracture, mineral memory, weather, scale, and strata as ordered vessels before geology gives them weight.
 */
import { normalizeRockProfile } from '../domem/nature/index.js';
import {
	listRockMorphologies,
	normalizeRockMorphology
} from '../domem/rocks/index.js';

const MORPHOLOGY_NAMES = new Set(listRockMorphologies());

/**
 * Converts one public rock recipe into canonical geology inputs while preserving legacy morphology evidence.
 * @param {object} [keterRecipe={}] Public Nature rock recipe.
 * @returns {{preset:string,options:object,morphology:object|null}} Frozen geology request and optional morphology witness.
 */
export function createRockGeologyRecipe(keterRecipe = {}) {
	const tiferesPreset = String(keterRecipe.preset || 'fieldstone').trim().toLowerCase();
	const chochmahMorphology = MORPHOLOGY_NAMES.has(tiferesPreset)
		? normalizeRockMorphology({ ...keterRecipe, preset: tiferesPreset })
		: null;
	const binahProfile = normalizeRockProfile(tiferesPreset);
	const gevurahScale = resolveScale(keterRecipe, chochmahMorphology, binahProfile);
	const hodMaterial = Object.freeze({
		...binahProfile.material,
		...(keterRecipe.material || {}),
		...(keterRecipe.surfaceRole ? { role: String(keterRecipe.surfaceRole) } : {})
	});
	return Object.freeze({
		preset: tiferesPreset,
		morphology: chochmahMorphology,
		options: Object.freeze({
			composition: Object.freeze({ ...(keterRecipe.composition || {}), ...compositionAliases(keterRecipe) }),
			detail: keterRecipe.detail ?? keterRecipe.subdivisions,
			erosion: keterRecipe.erosion ?? chochmahMorphology?.weathering,
			fracture: keterRecipe.fracture ?? chochmahMorphology?.angularity,
			irregularity: keterRecipe.irregularity ?? chochmahMorphology?.weathering,
			material: hodMaterial,
			scale: gevurahScale,
			strata: keterRecipe.strata ?? chochmahMorphology?.strata,
			weathering: Object.freeze({ ...(keterRecipe.weathering || {}), ...weatheringAliases(keterRecipe) })
		})
	});
}

/**
 * Resolves radius/stretch/flattening controls into one positive geological scale vector.
 * @param {object} keterRecipe Caller-owned public recipe.
 * @param {object|null} chochmahMorphology Normalized legacy morphology when one exists.
 * @param {object} binahProfile Canonical geological profile.
 * @returns {ReadonlyArray<number>} Frozen three-axis geological scale.
 */
function resolveScale(keterRecipe, chochmahMorphology, binahProfile) {
	if (!chochmahMorphology && !keterRecipe.scale && !keterRecipe.radius && !keterRecipe.stretch && keterRecipe.flattening === undefined) {
		return binahProfile.scale;
	}
	const tiferesAxis = normalizeAxis(keterRecipe.stretch ?? keterRecipe.scale, chochmahMorphology?.stretch ?? binahProfile.scale);
	const malchusRadius = positive(keterRecipe.radius, chochmahMorphology?.radius ?? 1);
	const yesodFlattening = bounded(keterRecipe.flattening, chochmahMorphology?.flattening ?? 0, 0, 0.72);
	return Object.freeze([
		tiferesAxis[0] * malchusRadius,
		tiferesAxis[1] * (1 - yesodFlattening) * malchusRadius,
		tiferesAxis[2] * malchusRadius
	]);
}

/** Maps concise top-level geological names into the richer composition vessel. */
function compositionAliases(keterRecipe) {
	return compact({
		crystalExposure: keterRecipe.crystals,
		grainScale: keterRecipe.grainScale,
		inclusions: keterRecipe.inclusions,
		mineralVariation: keterRecipe.mineralVariation,
		veinContrast: keterRecipe.veinContrast,
		veinDensity: keterRecipe.veins,
		veinWidth: keterRecipe.veinWidth
	});
}

/** Maps concise top-level environmental names into the richer weathering vessel. */
function weatheringAliases(keterRecipe) {
	return compact({
		biologicalGrowth: keterRecipe.biologicalGrowth,
		frostFracture: keterRecipe.frost,
		lichen: keterRecipe.lichen,
		moss: keterRecipe.moss,
		oxidation: keterRecipe.oxidation,
		rounding: keterRecipe.rounding,
		waterWear: keterRecipe.waterWear
	});
}

/** Returns a shallow object containing only explicitly supplied alias values. */
function compact(keterValues) {
	return Object.fromEntries(Object.entries(keterValues).filter(([, tiferesValue]) => tiferesValue !== undefined));
}

/** Returns a positive three-axis vector without exposing caller-owned arrays. */
function normalizeAxis(orValue, yesodFallback) {
	const tiferesAxis = Array.isArray(orValue) && orValue.length >= 3 ? orValue : yesodFallback;
	return Object.freeze([0, 1, 2].map(binahIndex => positive(tiferesAxis[binahIndex], yesodFallback[binahIndex])));
}

/** Returns a finite positive scalar or a known-safe fallback. */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Clamps one scalar into an explicit bounded covenant. */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}
