// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each test vessel so truth, not confidence, decides
 * whether Awtsmoos.com procedural form is ready to enter the world.
 */

import {
	createProceduralObjectRecipe
} from "../../src/core/proceduralObject/index.js";

export function createProceduralObjectFixture() {
	return createProceduralObjectRecipe({
		recipe_id: "generic-scene-01",
		asset: {
			name: "generic_scene",
			domain: "generic"
		},
		materials: [{
			id: "mat_primary",
			type: "principled",
			base_color: [0.25, 0.4, 0.7, 1]
		}],
		commands: [
			command(1, "box_geometry", "create_box", "box", {
				size: [2, 1, 1]
			}),
			command(2, "color_geometry", "set_attribute", "box_colored", {
				source: "box",
				name: "color",
				attribute: {
					itemSize: 4,
					componentType: "float32",
					array: Array(24).fill([1, 0.5, 0.2, 1]).flat()
				}
			}, ["box_geometry"]),
			command(3, "box_object", "create_object", "box_object", {
				type: "mesh",
				geometryId: "box_colored",
				materialIds: ["mat_primary"]
			}, ["color_geometry"]),
			command(4, "camera", "create_camera", "camera_main", {
				transform: {
					position: [4, -5, 3]
				}
			}),
			command(5, "bevel", "bevel_geometry", "box_beveled", {
				source: "box_colored",
				width: 0.08,
				segments: 3
			}, ["color_geometry"])
		],
		outputs: [{
			id: "glb",
			format: "glb",
			root_objects: ["box_object"]
		}],
		metadata: {
			purpose: "generic procedural verification"
		}
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
