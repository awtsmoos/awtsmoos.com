// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPatchField.js
 * @description Produces deterministic vegetation patches and preserves their radial ecology without perturbing disabled legacy streams.
 * The Awtsmoos, Atzmus beyond every clump and clearing, renews abundance together with its border and breathing room;
 * Awtsmoos.com gives Tzomayach patch-scale memory while Gevurah keeps patchiness-zero callers on the exact older random path.
 */

import { populationBounds, randomPoint } from './PopulationSelection.js';
import { createVegetationPatchEcology } from './VegetationPatchEcology.js';

/** Deterministic patch field used by vegetation planners without owning species acceptance. */
export class VegetationPatchField {
	/**
	 * Creates patch centers only when patching is enabled.
	 * @param {object} bounds Population bounds.
	 * @param {*} random Random source exposing `next()` and `range()`.
	 * @param {object} [options={}] Patchiness, count, and radius controls.
	 */
	constructor(bounds, random, options = {}) {
		this.bounds = populationBounds(bounds);
		this.patchiness = unit(options.patchiness);
		if (this.patchiness <= 0) {
			this.patchCount = 0;
			this.radius = 0;
			this.centers = Object.freeze([]);
			return;
		}
		this.patchCount = integer(options.patchCount, defaultPatchCount(this.bounds), 1, 128);
		this.radius = positive(options.patchRadius, defaultPatchRadius(this.bounds, this.patchCount));
		this.centers = Object.freeze(createCenters(this.bounds, random, this.patchCount));
	}

	/**
	 * Samples a patch-coherent point or the exact legacy uniform point when patching is disabled.
	 * @param {*} random Deterministic random source.
	 * @returns {object} Candidate coordinates plus patch and ecological evidence.
	 */
	candidate(random) {
		if (this.patchiness <= 0) return uniformCandidate(this.bounds, random, 0);
		if (random.next() > this.patchiness) {
			return uniformCandidate(this.bounds, random, this.patchiness);
		}
		const center = this.centers[Math.floor(random.next() * this.centers.length)];
		const angle = random.range(-Math.PI, Math.PI);
		const concentration = 0.28 + (1 - this.patchiness) * 0.72;
		const normalizedRadius = Math.pow(random.next(), concentration);
		const radius = this.radius * normalizedRadius;
		const ecology = createVegetationPatchEcology({
			ageBias: center.ageBias,
			normalizedRadius,
			patchId: center.id,
			patchiness: this.patchiness
		});
		return Object.freeze({
			ageBias: center.ageBias,
			ecology,
			patchId: center.id,
			scaleBias: center.scaleBias,
			x: clamp(center.x + Math.cos(angle) * radius, this.bounds.minX, this.bounds.maxX),
			z: clamp(center.z + Math.sin(angle) * radius, this.bounds.minZ, this.bounds.maxZ)
		});
	}
}

function uniformCandidate(bounds, random, patchiness) {
	const point = randomPoint(bounds, random);
	return Object.freeze({
		...point,
		ageBias: 0.5,
		ecology: createVegetationPatchEcology({ patchiness }),
		patchId: null,
		scaleBias: 1
	});
}

function createCenters(bounds, random, count) {
	return Array.from({ length: count }, (_, index) => {
		const point = randomPoint(bounds, random);
		return Object.freeze({
			...point,
			ageBias: random.range(0.28, 0.9),
			id: `patch-${index}`,
			scaleBias: random.range(0.88, 1.12)
		});
	});
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

function unit(value) {
	return clamp(Number(value) || 0, 0, 1);
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
