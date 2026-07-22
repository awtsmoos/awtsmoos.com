// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers genome, anatomy, operations, and rig into the existing
 * validated animal recipe. No alternate schema is born here; Awtsmoos.com
 * receives a deterministic phenotype that the established compiler can run.
 */

import { createAnimalMeshRecipe } from "../../recipes/createAnimalMeshRecipe.js";
import { createPhenotypeCommands } from "./phenotypeCommandFactory.js";
import { createPhenotypeRig } from "./phenotypeRigFactory.js";

function allPoints(guides) {
	return Object.values(guides).flatMap((guide) => guide.centerline);
}

function measurements(guides) {
	const points = allPoints(guides);
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (const point of points) {
		for (let axis = 0; axis < 3; axis += 1) {
			minimum[axis] = Math.min(minimum[axis], point[axis]);
			maximum[axis] = Math.max(maximum[axis], point[axis]);
		}
	}
	const size = maximum.map((value, axis) => value - minimum[axis]);
	return {
		overall_length: { value: Math.max(...size), confidence: 1 },
		shoulder_height: { value: Math.max(0, maximum[2]), confidence: 1 }
	};
}

function material(options) {
	return {
		id: options.materialId,
		type: "principled",
		base_color: options.baseColor,
		roughness: options.roughness,
		metallic: 0
	};
}

function partNames(guides, symmetryPairs) {
	return [
		...Object.keys(guides),
		...symmetryPairs.map((pair) => pair.right)
	];
}

function normalizedOptions(profile, options) {
	return {
		materialId: options.materialId || "phenotype_surface",
		baseColor: options.baseColor || [0.42, 0.31, 0.2, 1],
		roughness: Number.isFinite(options.roughness) ? options.roughness : 0.72,
		targetTriangles: Math.max(1000, Math.floor(options.targetTriangleCount || 28000)),
		maximumTriangles: Math.max(2000, Math.floor(options.maximumTriangleCount || 60000)),
		name: options.name || `${profile.archetype_id}_${profile.genome.id}`
	};
}

export function createPhenotypeRecipe(profile, guides, symmetryPairs, options = {}) {
	const resolved = normalizedOptions(profile, options);
	const parts = partNames(guides, symmetryPairs);
	const commands = createPhenotypeCommands(guides, symmetryPairs, resolved.materialId);
	const rig = createPhenotypeRig(profile, guides, symmetryPairs);
	return createAnimalMeshRecipe({
		asset: {
			name: resolved.name,
			species: options.species || `Procedural ${profile.archetype_id}`,
			common_name: options.commonName || `${profile.archetype_id} phenotype`,
			pose: options.pose || "neutral_procedural",
			style: options.style || "deterministic_procedural",
			target_triangle_count: resolved.targetTriangles,
			maximum_triangle_count: resolved.maximumTriangles,
			texture_resolution: Math.max(64, Math.floor(options.textureResolution || 1024)),
			generate_rig: true,
			generate_uvs: true,
			generate_lods: true
		},
		references: [{
			reference_id: "procedural_genome",
			view: "front_three_quarter",
			image_file_id: `procedural:${profile.genome.id}`,
			orthographic_confidence: 1,
			pose_consistency: 1,
			usable_for_width: true,
			usable_for_height: true,
			usable_for_depth: true,
			notes: "Generated from a bounded deterministic genome; no image upload was inferred."
		}],
		measurements: measurements(guides),
		landmarks: {},
		anatomical_guides: guides,
		materials: [material(resolved)],
		parts,
		commands,
		rig,
		validation: {
			must_be_manifold: true,
			must_be_watertight: true,
			maximum_bone_influences: 4,
			maximum_triangle_count: resolved.maximumTriangles,
			required_named_parts: parts
		},
		uncertainties: []
	});
}
