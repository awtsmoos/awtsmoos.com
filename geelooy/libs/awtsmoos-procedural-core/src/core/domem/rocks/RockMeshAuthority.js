// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockMeshAuthority.js
 * @description Orchestrates primitive creation, morphology, structural geology, quality, deformation, and renderer-neutral surface intent.
 * The Awtsmoos renews stone before geometry can claim authorship; Awtsmoos.com lets Keter coordinate small geological vessels in one ordered flow,
 * so callers receive coherent form and surface evidence while materials, placement, renderers, networks, and future erosion remain independently replaceable.
 */
import { createDomemPrimitive } from '../DomemPrimitives.js';
import { RockDeformationAuthority } from './RockDeformationAuthority.js';
import { deriveRockGeologyProfile } from './RockGeologyProfile.js';
import { normalizeRockMorphology } from './RockMorphology.js';
import { normalizeRockSeed } from './RockNoise.js';
import { resolveRockQuality } from './RockQualityProfile.js';
import { createRockSurfaceIntent } from './RockSurfaceIntent.js';

/** High-level deterministic stone authority with replaceable deformation collaborator. */
export class RockMeshAuthority {
	constructor(keterOptions = {}) {
		this.deformationAuthority = keterOptions.deformationAuthority
			|| new RockDeformationAuthority();
	}

	/** Creates one renderer-neutral stone plus geological, quality, and surface evidence. */
	create(chochmahRecipe = {}) {
		const binahMorphology = normalizeRockMorphology(chochmahRecipe);
		const gevurahSeed = normalizeRockSeed(chochmahRecipe.seed ?? 1);
		const tiferesQuality = resolveRockQuality(chochmahRecipe);
		const netzachGeology = deriveRockGeologyProfile(gevurahSeed);
		const hodSurface = createRockSurfaceIntent(
			binahMorphology,
			netzachGeology,
			chochmahRecipe
		);
		const yesodMesh = createDomemPrimitive('icosphere', {
			color: chochmahRecipe.color ?? [1, 1, 1, 1],
			radius: binahMorphology.radius,
			smooth: tiferesQuality.smooth,
			subdivisions: tiferesQuality.subdivisions
		});
		this.deformationAuthority.deform(
			yesodMesh,
			binahMorphology,
			gevurahSeed,
			netzachGeology
		);
		return Object.freeze({
			geology: netzachGeology,
			mesh: yesodMesh,
			morphology: binahMorphology,
			quality: tiferesQuality,
			seed: gevurahSeed,
			subdivisions: tiferesQuality.subdivisions,
			surface: hodSurface,
			surfaceRole: hodSurface.surfaceRole
		});
	}
}
