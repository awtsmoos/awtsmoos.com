// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockProfiles.js
 * @description Normalizes immutable rock catalog truth, formation causes, composition, weathering, scale, material policy, and expert overrides.
 * The Awtsmoos, Atzmus beyond every geological name, renews preset and exception before either can claim independent power;
 * Awtsmoos.com keeps the simple stone-name doorway while deeper mineral, weather, and formation vessels unfold like light through a tower.
 */

import { createRockCompositionIntent } from './RockCompositionIntent.js';
import { createRockFormationIntent } from './RockFormationIntent.js';
import {
	listRockProfileRecords,
	rockProfileRecord
} from './RockProfileCatalog.js';
import { createRockWeatheringIntent } from './RockWeatheringIntent.js';

/**
 * Lists every canonical natural-rock profile supported by the simple Nature API.
 * @returns {ReadonlyArray<string>} Stable frozen natural-rock profile names.
 */
export function listRockProfiles() {
	return listRockProfileRecords();
}

/**
 * Resolves one canonical geology profile plus explicit caller overrides without mutating shared catalog or caller data.
 * Formation defaults flow into existing composition/weathering contracts; explicit nested and legacy top-level values remain sovereign.
 * @param {string} [profileName='fieldstone'] Canonical natural-rock profile name.
 * @param {object} [overrides={}] Expert geometry, material, formation, composition, and weathering overrides.
 * @returns {Readonly<object>} Deeply bounded normalized geological profile.
 */
export function normalizeRockProfile(profileName = 'fieldstone', overrides = {}) {
	const binahBase = rockProfileRecord(profileName);
	const chochmahFormation = createRockFormationIntent(
		binahBase.formation,
		overrides.formation
	);
	const hodStrata = boundedUnit(overrides.strata, binahBase.strata);
	const netzachErosion = boundedUnit(overrides.erosion, binahBase.erosion);
	const tiferesComposition = createRockCompositionIntent({
		...chochmahFormation.composition,
		...overrides,
		...(overrides.composition || {})
	}, hodStrata);
	const malchusWeathering = createRockWeatheringIntent({
		...chochmahFormation.weathering,
		...overrides,
		...(overrides.weathering || {})
	}, netzachErosion);

	return Object.freeze({
		composition: tiferesComposition,
		detail: boundedInteger(overrides.detail, binahBase.detail, 0, 4),
		erosion: netzachErosion,
		formation: chochmahFormation,
		fracture: boundedUnit(overrides.fracture, binahBase.fracture),
		id: binahBase.id,
		irregularity: boundedUnit(overrides.irregularity, binahBase.irregularity),
		material: normalizeMaterial(binahBase.material, overrides.material),
		scale: Object.freeze(normalizeScale(overrides.scale, binahBase.scale)),
		strata: hodStrata,
		weathering: malchusWeathering
	});
}

/**
 * Normalizes a material override while preserving the established object form and allowing a concise semantic-role string.
 * @param {Readonly<object>} base Canonical material policy.
 * @param {unknown} override Optional role string or material-policy object.
 * @returns {Readonly<object>} Frozen material policy.
 */
function normalizeMaterial(base, override) {
	const yesodOverride = typeof override === 'string'
		? { role: override }
		: (override || {});
	return Object.freeze({
		...base,
		...yesodOverride
	});
}

/** @param {unknown} value Explicit scale. @param {ReadonlyArray<number>} fallback Preset scale. @returns {number[]} Positive scale triple. */
function normalizeScale(value, fallback) {
	const yesodScale = Array.isArray(value) ? value : fallback;
	return [0, 1, 2].map((index) => positive(yesodScale[index], fallback[index]));
}

/** @param {unknown} value Explicit intensity. @param {number} fallback Preset intensity. @returns {number} Bounded 0..1 intensity. */
function boundedUnit(value, fallback) {
	const gevurahValue = Number(value);
	return Number.isFinite(gevurahValue)
		? Math.min(1, Math.max(0, gevurahValue))
		: fallback;
}

/** @param {unknown} value Explicit integer. @param {number} fallback Fallback. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded integer. */
function boundedInteger(value, fallback, minimum, maximum) {
	const gevurahValue = Math.floor(Number(value));
	return Number.isFinite(gevurahValue)
		? Math.min(maximum, Math.max(minimum, gevurahValue))
		: fallback;
}

/** @param {unknown} value Candidate positive scalar. @param {number} fallback Safe fallback. @returns {number} Positive finite scalar. */
function positive(value, fallback) {
	const malchusValue = Number(value);
	return Number.isFinite(malchusValue) && malchusValue > 0
		? malchusValue
		: fallback;
}
