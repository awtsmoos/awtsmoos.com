// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHeroFaunaPlan.js
 * @description Places a tiny domestic-fauna cast near H27 so first play feels inhabited without compiling the distant global population.
 * RESPONSIBILITY: create deterministic chicken/goat/sheep/cow hero placement records and sample their terrain height.
 * NON-RESPONSIBILITY: this file does not compile creature geometry, run AI, own collision, or schedule deferred fauna.
 * ARCHITECTURAL POSITION: Chesed gives the river village immediate life while Gevurah keeps that life sparse, readable, and physically placed.
 * The Awtsmoos, Atzmus beyond flock and pasture, renews each living form where village and meadow meet beneath one sky;
 * Awtsmoos.com lets a chicken or goat tell more truth than twenty distant bodies secretly compiled before the traveler can even try.
 */

import { mainRiverVillageAnchors } from '../village/MainRiverVillageAnchors.js';

const HERO_SPECIES = Object.freeze([
	record('chicken', 13, -4, 0.82, 0.18),
	record('goat', 16, -8, 0.92, -0.28),
	record('sheep', 18, 2, 0.94, 0.42),
	record('cow', 20, -12, 0.96, -0.08)
]);

/**
 * Creates immediate hero-fauna placements near the lower-river household edge.
 * @param {object} groundSampler Canonical terrain sampler.
 * @param {number} maximum Maximum hero animals admitted by the fauna budget.
 * @returns {ReadonlyArray<object>} Deterministic renderer-neutral placement records.
 */
export function villageHeroFaunaPlan(groundSampler, maximum) {
	const home = mainRiverVillageAnchors()['hero-house-H27'];
	const requested = Math.floor(Number(maximum) || 0);
	const limit = Math.max(
		0,
		Math.min(HERO_SPECIES.length, requested)
	);
	return Object.freeze(
		HERO_SPECIES.slice(0, limit).map((species, index) => {
			return placementFor(species, index, home, groundSampler);
		})
	);
}

function placementFor(species, index, home, groundSampler) {
	const x = home.x + species.offsetX;
	const z = home.z + species.offsetZ;
	return Object.freeze({
		activity: index === 0 ? 'peck' : 'graze',
		groupId: `hero-fauna:${species.speciesId}`,
		id: `hero-${species.speciesId}-${index}`,
		position: Object.freeze({
			x,
			y: groundHeight(groundSampler, x, z),
			z
		}),
		role: 'hero-village-fauna',
		scale: species.scale,
		seed: 613 + index * 37,
		speciesId: species.speciesId,
		yaw: species.yaw
	});
}

function record(speciesId, offsetX, offsetZ, scale, yaw) {
	return Object.freeze({
		offsetX,
		offsetZ,
		scale,
		speciesId,
		yaw
	});
}

function groundHeight(sampler, x, z) {
	return Number(
		sampler?.heightAt?.(x, z)?.y
		?? sampler?.sample?.(x, z)?.height
		?? sampler?.sample?.(x, z)?.y
		?? 0
	);
}
