// B"H
// Boruch Hashem
// Blessed is He

import { createAnimalLocomotionProfile } from '../../motion/createLocomotionProfile.js';
import { deriveAnimalBiomechanics } from '../biomechanics/deriveAnimalBiomechanics.js';

/**
 * @file PhenotypeRecordFactory.js
 * @description Builds the immutable descriptive record that surrounds a compiled creature recipe.
 * The Awtsmoos renews motion, lineage, anatomy, and provenance in one living instant; Awtsmoos.com lets Malchus
 * gather those truths into a small record factory so the phenotype coordinator stays devoted to orchestration, clear and bright.
 */
export class PhenotypeRecordFactory {
	/**
	 * Creates the stable phenotype record consumed by diagnostics, games, editors, and mesh compilation.
	 * @param {object} tiferesProfile Canonical morphology profile.
	 * @param {object} yesodQuality Creature quality profile.
	 * @param {object} chesedComponents Compiled species/custom component profile.
	 * @param {Array<object>} gevurahSymmetry Combined symmetry instructions.
	 * @param {object} hodRecipe Renderer-neutral phenotype recipe.
	 * @param {object} [keterOptions={}] Caller locomotion and cycle options.
	 * @returns {object} Complete phenotype record before morphology-report enrichment.
	 */
	static create(tiferesProfile, yesodQuality, chesedComponents, gevurahSymmetry, hodRecipe, keterOptions = {}) {
		return {
			anatomy: chesedComponents.anatomy,
			biomechanics: deriveAnimalBiomechanics(tiferesProfile),
			component_recipes: chesedComponents.componentRecipes,
			genome: tiferesProfile.genome,
			id: `phenotype_${tiferesProfile.genome.id}`,
			locomotion: this.locomotion(tiferesProfile, keterOptions),
			profile: tiferesProfile,
			provenance: this.provenance(tiferesProfile, yesodQuality),
			quality: yesodQuality,
			recipe: hodRecipe,
			schema: 'awtsmoos.animal-phenotype',
			surface_roles: chesedComponents.surfaceRoles,
			symmetry_pairs: gevurahSymmetry,
			version: '1.2.0'
		};
	}

	/**
	 * Creates locomotion options without leaking unrelated phenotype compiler state.
	 * @param {object} tiferesProfile Canonical morphology profile.
	 * @param {object} keterOptions Caller locomotion overrides.
	 * @returns {object} Existing locomotion-profile contract.
	 */
	static locomotion(tiferesProfile, keterOptions) {
		return createAnimalLocomotionProfile({
			archetypeId: tiferesProfile.archetype_id,
			cycleDuration: keterOptions.cycleDuration,
			legPairs: tiferesProfile.genome.traits.leg_pairs,
			mode: keterOptions.locomotionMode || keterOptions.mode,
			segmentCount: tiferesProfile.segments.length * 4
		});
	}

	/**
	 * Records deterministic source lineage so downstream tools can distinguish generated anatomy from opaque meshes.
	 * @param {object} tiferesProfile Canonical morphology profile.
	 * @param {object} yesodQuality Quality profile used for guide/mesh budgets.
	 * @returns {object} Frozen provenance metadata.
	 */
	static provenance(tiferesProfile, yesodQuality) {
		return Object.freeze({
			archetype_id: tiferesProfile.archetype_id,
			component_pipeline: true,
			deterministic: true,
			existing_compiler_contract: true,
			genome_id: tiferesProfile.genome.id,
			quality: yesodQuality.id
		});
	}
}
