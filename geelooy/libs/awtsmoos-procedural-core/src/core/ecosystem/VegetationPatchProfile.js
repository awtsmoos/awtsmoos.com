// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPatchProfile.js
 * @description Normalizes optional patch controls and creates deterministic patch centers without changing legacy random streams.
 * The Awtsmoos renews center and edge together, while Awtsmoos.com gives clustering, succession, and age variance their measured keli;
 * old callers still receive the same unadorned path, while richer ecological intent may enter without teaching the field about UI-level realism names.
 */

import { populationBounds, randomPoint } from './PopulationSelection.js';

/**
 * Builds one immutable patch profile from generic ecological controls.
 * @param {object} boundsInput Population bounds.
 * @param {*} random Deterministic random source.
 * @param {object} [options={}] Generic patch controls.
 * @returns {Readonly<object>} Normalized patch profile and deterministic centers.
 */
export function createVegetationPatchProfile(boundsInput, random, options = {}) {
	const bounds = populationBounds(boundsInput);
	const patchiness = unit(options.patchiness);
	const controls = ecologicalControls(options);
	if (patchiness <= 0) {
		return Object.freeze({ bounds, patchiness, controls, patchCount: 0, radius: 0, centers: Object.freeze([]) });
	}
	const patchCount = integer(options.patchCount, defaultPatchCount(bounds), 1, 128);
	const radius = positive(options.patchRadius, defaultPatchRadius(bounds, patchCount));
	const centers = Object.freeze(createCenters(bounds, random, patchCount, controls));
	return Object.freeze({ bounds, patchiness, controls, patchCount, radius, centers });
}

/**
 * Samples normalized radial distance while optional clustering and edge falloff shape the same single random draw.
 * @param {*} random Deterministic random source.
 * @param {number} patchiness Active patchiness.
 * @param {Readonly<object>} controls Optional normalized controls.
 * @returns {number} Normalized radius in 0..1.
 */
export function sampleVegetationPatchRadius(random, patchiness, controls) {
	const legacyExponent = 0.28 + (1 - patchiness) * 0.72;
	if (controls.clustering == null && controls.edgeFalloff == null) {
		return Math.pow(random.next(), legacyExponent);
	}
	const clustering = controls.clustering ?? 0.5;
	const edgeFalloff = controls.edgeFalloff ?? 0.5;
	const shaping = clamp(1 + (clustering - 0.5) * 0.8 + (edgeFalloff - 0.5) * 0.35, 0.55, 1.55);
	return Math.pow(random.next(), legacyExponent * shaping);
}

function ecologicalControls(options) {
	return Object.freeze({
		ageVariance: optionalUnit(options.patchAgeVariance),
		clustering: optionalUnit(options.patchClustering),
		competition: optionalUnit(options.patchCompetition),
		edgeFalloff: optionalUnit(options.patchEdgeFalloff),
		succession: optionalUnit(options.patchSuccession)
	});
}

function createCenters(bounds, random, count, controls) {
	return Array.from({ length: count }, (_, index) => {
		const point = randomPoint(bounds, random);
		const legacyAge = random.range(0.28, 0.9);
		return Object.freeze({
			...point,
			ageBias: ecologicalAgeBias(legacyAge, controls),
			id: `patch-${index}`,
			scaleBias: random.range(0.88, 1.12)
		});
	});
}

function ecologicalAgeBias(legacyAge, controls) {
	if (controls.succession == null && controls.ageVariance == null) return legacyAge;
	const center = controls.succession == null ? 0.59 : 0.18 + controls.succession * 0.78;
	const variance = controls.ageVariance == null ? 1 : 0.25 + controls.ageVariance * 1.15;
	return clamp(center + (legacyAge - 0.59) * variance, 0.08, 1);
}

function defaultPatchCount(bounds) {
	const area = (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ);
	return Math.max(3, Math.round(Math.sqrt(area) / 18));
}

function defaultPatchRadius(bounds, count) {
	const area = (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ);
	return Math.max(1, Math.sqrt(area / Math.max(1, count)) * 0.48);
}

function integer(value, fallback, minimum, maximum) {
	return Math.round(clamp(Number.isFinite(Number(value)) ? Number(value) : fallback, minimum, maximum));
}

function positive(value, fallback) {
	return Math.max(0.05, Number.isFinite(Number(value)) ? Number(value) : fallback);
}

function optionalUnit(value) {
	return value == null || value === '' ? null : unit(value);
}

function unit(value) {
	return clamp(Number(value) || 0, 0, 1);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
