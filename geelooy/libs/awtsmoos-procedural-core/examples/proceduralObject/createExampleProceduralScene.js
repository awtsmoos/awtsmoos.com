// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createProceduralObjectRecipe
} from "../../src/core/proceduralObject/index.js";

/**
 * Creates a generic scene showing core and trusted-adapter operations.
 *
 * @returns {object} Complete procedural recipe.
 */
export function createExampleProceduralScene() {
	return createProceduralObjectRecipe({
		recipe_id: "awtsmoos-generic-object-example",
		asset: {
			name: "procedural_table_lamp",
			domain: "product"
		},
		materials: [
			material("paint", [0.08, 0.12, 0.2, 1], 0.3),
			material("shade", [0.85, 0.72, 0.45, 1], 0.8)
		],
		commands: [
			command(1, "base", "revolve_profile", "base", {
				profile: [[0.32, 0], [0.4, 0.08], [0.24, 0.2], [0.12, 0.28]]
			}),
			command(2, "stem", "create_cylinder", "stem", {
				radius: 0.045,
				height: 1.1,
				center: [0, 0, 0.83]
			}),
			command(3, "shade", "revolve_profile", "shade", {
				profile: [[0.18, 1.25], [0.42, 1.58], [0.28, 1.72]]
			}),
			command(4, "lamp", "merge_geometries", "lamp_geometry", {
				sources: ["base", "stem", "shade"]
			}, ["base", "stem", "shade"]),
			command(5, "lamp_object", "create_object", "lamp", {
				type: "mesh",
				geometryId: "lamp_geometry",
				materialIds: ["paint", "shade"]
			}, ["lamp"]),
			command(6, "bevel", "bevel_geometry", "lamp_finished", {
				source: "lamp_geometry",
				width: 0.015,
				segments: 3
			}, ["lamp"]),
			command(7, "export", "export_asset", "lamp_glb", {
				format: "glb",
				root_objects: ["lamp"]
			}, ["lamp_object", "bevel"])
		],
		outputs: [{
			id: "lamp_glb",
			format: "glb",
			root_objects: ["lamp"]
		}]
	});
}

function command(index, id, op, target, args, dependsOn = []) {
	return {
		index,
		id,
		op,
		target,
		depends_on: dependsOn,
		args
	};
}

function material(id, baseColor, roughness) {
	return {
		id,
		type: "principled",
		base_color: baseColor,
		roughness,
		metallic: 0
	};
}
