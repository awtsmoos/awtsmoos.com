// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPatchField.js
 * @description Produces deterministic patch-coherent candidates with optional area-preserving wind/slope anisotropy layered over established patch ecology.
 * The Awtsmoos renews clearing, clump, wind, and slope before distance receives a name; Awtsmoos.com lets the same random angle and radius enter a wiser vessel,
 * so advanced stands may stretch into corridors while callers with no directional intent keep the exact circular candidate path and random-stream behavior.
 */
import { createVegetationPatchEcology } from './VegetationPatchEcology.js';
import {
	createVegetationPatchProfile,
	sampleVegetationPatchRadius
} from './VegetationPatchProfile.js';
import {
	createVegetationPatchShape,
	shapeVegetationPatchOffset
} from './VegetationPatchShape.js';
import { randomPoint } from './PopulationSelection.js';

/** Deterministic patch field used by vegetation planners without owning species acceptance. */
export class VegetationPatchField {
	constructor(bounds, random, options = {}) {
		const tiferesProfile = createVegetationPatchProfile(bounds, random, options);
		this.bounds = tiferesProfile.bounds;
		this.patchiness = tiferesProfile.patchiness;
		this.patchCount = tiferesProfile.patchCount;
		this.radius = tiferesProfile.radius;
		this.centers = tiferesProfile.centers;
		this.controls = tiferesProfile.controls;
		this.shape = createVegetationPatchShape(options);
	}

	/** Samples one patch-coherent candidate or the exact legacy uniform candidate path. */
	candidate(random) {
		if (this.patchiness <= 0) return uniformCandidate(this.bounds, this.patchiness, this.controls, random);
		if (random.next() > this.patchiness) {
			return uniformCandidate(this.bounds, this.patchiness, this.controls, random);
		}
		const yesodCenter = this.centers[Math.floor(random.next() * this.centers.length)];
		const gevurahAngle = random.range(-Math.PI, Math.PI);
		const normalizedRadius = sampleVegetationPatchRadius(random, this.patchiness, this.controls);
		const physicalRadius = this.radius * normalizedRadius;
		const tiferesOffset = shapeVegetationPatchOffset(gevurahAngle, physicalRadius, this.shape);
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
			patchShape: this.shape,
			scaleBias: yesodCenter.scaleBias,
			x: clamp(yesodCenter.x + tiferesOffset.x, this.bounds.minX, this.bounds.maxX),
			z: clamp(yesodCenter.z + tiferesOffset.z, this.bounds.minZ, this.bounds.maxZ)
		});
	}
}

/** Preserves the established uniform candidate contract when no patch is selected. */
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

/** Clamps one coordinate inside population bounds. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
