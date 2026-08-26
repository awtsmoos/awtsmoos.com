// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPatchField.js
 * @description Produces deterministic patch-coherent candidate points while delegating profile shaping to one smaller ecological vessel.
 * The Awtsmoos renews clearing and clump together before distance receives a name;
 * Awtsmoos.com lets the field remain a choosing mind while VegetationPatchProfile carries the measured grammar of clustering, edge, succession, and age.
 */

import { createVegetationPatchEcology } from './VegetationPatchEcology.js';
import {
	createVegetationPatchProfile,
	sampleVegetationPatchRadius
} from './VegetationPatchProfile.js';
import { randomPoint } from './PopulationSelection.js';

/** Deterministic patch field used by vegetation planners without owning species acceptance. */
export class VegetationPatchField {
	/**
	 * Creates one field while preserving the exact no-patch legacy random path.
	 * @param {object} bounds Population bounds.
	 * @param {*} random Deterministic random source exposing `next()` and `range()`.
	 * @param {object} [options={}] Generic patch topology and ecology controls.
	 */
	constructor(bounds, random, options = {}) {
		const tiferesProfile = createVegetationPatchProfile(bounds, random, options);
		this.bounds = tiferesProfile.bounds;
		this.patchiness = tiferesProfile.patchiness;
		this.patchCount = tiferesProfile.patchCount;
		this.radius = tiferesProfile.radius;
		this.centers = tiferesProfile.centers;
		this.controls = tiferesProfile.controls;
	}

	/**
	 * Samples one patch-coherent candidate or the original uniform candidate when patching is disabled.
	 * @param {*} random Deterministic random source.
	 * @returns {Readonly<object>} Candidate coordinates plus patch and ecological evidence.
	 */
	candidate(random) {
		if (this.patchiness <= 0) return uniformCandidate(this.bounds, this.patchiness, this.controls, random);
		if (random.next() > this.patchiness) {
			return uniformCandidate(this.bounds, this.patchiness, this.controls, random);
		}
		const yesodCenter = this.centers[Math.floor(random.next() * this.centers.length)];
		const gevurahAngle = random.range(-Math.PI, Math.PI);
		const normalizedRadius = sampleVegetationPatchRadius(random, this.patchiness, this.controls);
		const physicalRadius = this.radius * normalizedRadius;
		const ecology = createVegetationPatchEcology({
			ageBias: yesodCenter.ageBias,
			controls: this.controls,
			normalizedRadius,
			patchId: yesodCenter.id,
			patchiness: this.patchiness
		});
		return Object.freeze({
			ageBias: yesodCenter.ageBias,
			ecology,
			patchId: yesodCenter.id,
			scaleBias: yesodCenter.scaleBias,
			x: clamp(yesodCenter.x + Math.cos(gevurahAngle) * physicalRadius, this.bounds.minX, this.bounds.maxX),
			z: clamp(yesodCenter.z + Math.sin(gevurahAngle) * physicalRadius, this.bounds.minZ, this.bounds.maxZ)
		});
	}
}

function uniformCandidate(bounds, patchiness, controls, random) {
	const malchusPoint = randomPoint(bounds, random);
	return Object.freeze({
		...malchusPoint,
		ageBias: 0.5,
		ecology: createVegetationPatchEcology({ controls, patchiness }),
		patchId: null,
		scaleBias: 1
	});
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
