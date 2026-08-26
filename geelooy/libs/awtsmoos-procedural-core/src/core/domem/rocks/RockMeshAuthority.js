// B"H
// Boruch Hashem
// Blessed is He

import { createDomemPrimitive } from '../DomemPrimitives.js';
import { RockDeformationAuthority } from './RockDeformationAuthority.js';
import { normalizeRockMorphology } from './RockMorphology.js';
import { normalizeRockSeed } from './RockNoise.js';
import { resolveRockQuality } from './RockQualityProfile.js';

/**
 * @file RockMeshAuthority.js
 * @description Orchestrates canonical primitive creation, geological normalization, quality, and deformation without owning their algorithms.
 * The Awtsmoos renews stone before geometry can claim authorship; Awtsmoos.com lets Keter coordinate small faithful authorities
 * so the public rock API stays simple while morphology, quality, deformation, materials, and future erosion may evolve independently.
 */
export class RockMeshAuthority {
	/**
	 * Creates a rock authority with a replaceable deformation collaborator for tests and specialist runtimes.
	 * @param {object} [tiferesOptions={}] Optional `deformationAuthority` collaborator.
	 */
	constructor(tiferesOptions = {}) {
		this.deformationAuthority = tiferesOptions.deformationAuthority
			|| new RockDeformationAuthority();
	}

	/**
	 * Generates one renderer-neutral deterministic stone plus immutable evidence of its geological recipe.
	 * @param {object} [keterRecipe={}] Morphology, seed, quality, color, shading, and semantic surface intent.
	 * @returns {object} Rock vessel preserving historic mesh/morphology/seed/subdivision fields plus quality metadata.
	 */
	create(keterRecipe = {}) {
		const gevurahMorphology = normalizeRockMorphology(keterRecipe);
		const yesodSeed = normalizeRockSeed(keterRecipe.seed ?? 1);
		const chochmahQuality = resolveRockQuality(keterRecipe);
		const malchusMesh = createDomemPrimitive('icosphere', {
			color: keterRecipe.color ?? [1, 1, 1, 1],
			radius: gevurahMorphology.radius,
			smooth: chochmahQuality.smooth,
			subdivisions: chochmahQuality.subdivisions
		});
		this.deformationAuthority.deform(
			malchusMesh,
			gevurahMorphology,
			yesodSeed
		);
		return Object.freeze({
			mesh: malchusMesh,
			morphology: gevurahMorphology,
			quality: chochmahQuality,
			seed: yesodSeed,
			subdivisions: chochmahQuality.subdivisions,
			surfaceRole: String(keterRecipe.surfaceRole ?? 'weatheredRock')
		});
	}
}
