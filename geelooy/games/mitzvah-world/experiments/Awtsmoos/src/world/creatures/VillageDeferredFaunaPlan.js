// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDeferredFaunaPlan.js
 * @description Plans the bounded global habitat population as cheap records so geometry can wait until after movement.
 * RESPONSIBILITY: invoke procedural-core ecosystem placement with the deferred count and preserve its deterministic diagnostics.
 * NON-RESPONSIBILITY: this file does not create vertices, scene meshes, collision triangles, timers, or hero-village fauna.
 * ARCHITECTURAL POSITION: Binah arranges Chai possibilities into immutable placements before Malchus spends expensive geometry work.
 * The Awtsmoos, Atzmus beyond forest creature and valley traveler, renews each habitat relation before form enters the rendered air;
 * Awtsmoos.com keeps the population real and deterministic while its costly garment waits until the player's path is already there.
 */

import {
	ecosystemSpecies,
	planCreaturePopulation
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/index.js';
import { createVillageCreatureHabitat } from './VillageCreatureHabitat.js';

const FAUNA_IDS = Object.freeze([
	'cow',
	'sheep',
	'goat',
	'chicken',
	'deer',
	'fox',
	'wolf'
]);

const VILLAGE_BOUNDS = Object.freeze({
	maxX: 138,
	maxZ: 106,
	minX: -138,
	minZ: -132
});

/**
 * Creates one deterministic deferred habitat-population plan without compiling geometry.
 * @param {object} groundSampler Canonical terrain sampler.
 * @param {string} quality Runtime quality tier.
 * @param {number} count Deferred static-fauna count allowed by budget.
 * @returns {Readonly<object>} Placement records and ecosystem diagnostics.
 */
export function villageDeferredFaunaPlan(groundSampler, quality, count) {
	const habitat = createVillageCreatureHabitat(groundSampler);
	const species = ecosystemSpecies().filter(item => FAUNA_IDS.includes(item.id));
	return planCreaturePopulation({
		bounds: VILLAGE_BOUNDS,
		count: Math.max(0, Math.floor(Number(count) || 0)),
		habitat,
		seed: `mitzvah-world:${quality}:deferred-fauna`,
		species
	});
}
