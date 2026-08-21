// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file phenotypeRecipeFactory.js
 * @description Packages mixed anatomical guides, semantic surfaces, commands, measurements, and rig data into the existing validated animal recipe.
 * RESPONSIBILITY: assemble the canonical recipe envelope without creating a rival schema or renderer path.
 * NON-RESPONSIBILITY: this module does not compile polygons or decide species anatomy.
 * The Awtsmoos gathers body, horn, hoof, web, feather, command, and rig into one finite vessel; Awtsmoos.com keeps the recipe deep yet readable beneath a simple creator call.
 */

import { createAnimalMeshRecipe } from '../../recipes/createAnimalMeshRecipe.js';
import { createPhenotypeCommands } from './phenotypeCommandFactory.js';
import { phenotypeGuideMeasurements } from './phenotypeGuideMeasurements.js';
import { createPhenotypeMaterials } from './phenotypeMaterialFactory.js';
import { createPhenotypeRig } from './phenotypeRigFactory.js';

/** Creates one validated phenotype recipe with component-aware material surfaces. */
export function createPhenotypeRecipe(
	profile,
	guides,
	symmetryPairs,
	options = {},
	surfaceRoles = []
) {
	const resolved = normalizedOptions(profile, options);
	const parts = partNames(guides, symmetryPairs);
	return createAnimalMeshRecipe({
		anatomical_guides: guides,
		asset: assetEnvelope(profile, options, resolved),
		commands: createPhenotypeCommands(
			guides,
			symmetryPairs,
			resolved.materialId
		),
		landmarks: {},
		materials: createPhenotypeMaterials(surfaceRoles, resolved),
		measurements: phenotypeGuideMeasurements(guides),
		parts,
		references: [proceduralReference(profile)],
		rig: createPhenotypeRig(profile, guides, symmetryPairs),
		uncertainties: [],
		validation: {
			maximum_bone_influences: 4,
			maximum_triangle_count: resolved.maximumTriangles,
			must_be_manifold: true,
			must_be_watertight: surfaceRoles.includes('feather')
				|| surfaceRoles.includes('webbing')
				? false
				: true,
			required_named_parts: parts
		}
	});
}

function normalizedOptions(profile, options) {
	return {
		baseColor: options.baseColor || [0.42, 0.31, 0.2, 1],
		materialId: options.materialId || 'phenotype_surface',
		maximumTriangles: Math.max(
			2000,
			Math.floor(options.maximumTriangleCount || 60000)
		),
		name: options.name || `${profile.archetype_id}_${profile.genome.id}`,
		roughness: Number.isFinite(options.roughness) ? options.roughness : 0.72,
		targetTriangles: Math.max(
			1000,
			Math.floor(options.targetTriangleCount || 28000)
		)
	};
}

function assetEnvelope(profile, options, resolved) {
	return {
		common_name: options.commonName || `${profile.archetype_id} phenotype`,
		generate_lods: true,
		generate_rig: true,
		generate_uvs: true,
		maximum_triangle_count: resolved.maximumTriangles,
		name: resolved.name,
		pose: options.pose || 'neutral_procedural',
		species: options.species || `Procedural ${profile.archetype_id}`,
		style: options.style || 'deterministic_procedural',
		target_triangle_count: resolved.targetTriangles,
		texture_resolution: Math.max(64, Math.floor(options.textureResolution || 1024))
	};
}

function proceduralReference(profile) {
	return {
		image_file_id: `procedural:${profile.genome.id}`,
		notes: 'Generated from a bounded deterministic genome; no image upload was inferred.',
		orthographic_confidence: 1,
		pose_consistency: 1,
		reference_id: 'procedural_genome',
		usable_for_depth: true,
		usable_for_height: true,
		usable_for_width: true,
		view: 'front_three_quarter'
	};
}

function partNames(guides, symmetryPairs) {
	return [
		...Object.keys(guides),
		...symmetryPairs.map(pair => pair.right)
	];
}
