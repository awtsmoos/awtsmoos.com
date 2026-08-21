// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-primitive.js
 * @description Converts one GLTF primitive into native geometry and mesh vessels with skin-ready attributes.
 * The Awtsmoos renews vertex, normal, joint, weight, and material before one primitive may appear;
 * Awtsmoos.com keeps primitive construction separate from node hierarchy so reusable model law stays clear.
 */

import {
	BufferGeometry,
	Mesh
} from "./tiny-runtime.js";
import { normalizeWeightsAttribute } from "./tiny-gltf-accessors.js";
import { defaultTinyMaterial } from "./tiny-gltf-materials.js";

const ATTRIBUTE_NAMES = Object.freeze({
	POSITION: "position",
	NORMAL: "normal",
	TEXCOORD_0: "uv",
	COLOR_0: "color",
	JOINTS_0: "joints",
	WEIGHTS_0: "weights"
});

/**
 * Creates one native mesh from a GLTF primitive.
 * @param {Array<object>} materials Native material list.
 * @param {Function} getAccessor Cached accessor getter.
 * @param {object} primitive GLTF primitive definition.
 * @param {object} meshDefinition GLTF mesh definition.
 * @param {object} nodeDefinition GLTF node definition.
 * @param {number} primitiveIndex Primitive index inside mesh.
 * @returns {Mesh} Native mesh.
 */
export function createGltfPrimitiveMesh(
	materials,
	getAccessor,
	primitive,
	meshDefinition,
	nodeDefinition,
	primitiveIndex
) {
	const geometry = new BufferGeometry();
	geometry.mode = primitive.mode ?? 4;
	geometry.userData = {
		primitive,
		primitiveIndex
	};
	for (const [semantic, accessorIndex] of Object.entries(
		primitive.attributes || {}
	)) {
		const attributeName = ATTRIBUTE_NAMES[semantic];
		if (!attributeName) continue;
		let attribute = getAccessor(accessorIndex);
		if (attributeName === "weights") {
			attribute = normalizeWeightsAttribute(attribute);
		}
		geometry.setAttribute(attributeName, attribute);
	}
	if (primitive.indices !== undefined) {
		geometry.setIndex(getAccessor(primitive.indices));
	}
	const material = primitive.material !== undefined
		? materials[primitive.material]
		: defaultTinyMaterial();
	const mesh = new Mesh(geometry, material);
	mesh.name = meshDefinition.name
		|| nodeDefinition.name
		|| `mesh_${nodeDefinition.mesh}_${primitiveIndex}`;
	mesh.skinIndex = nodeDefinition.skin ?? null;
	mesh.primitiveMode = geometry.mode;
	mesh.userData = {
		meshDef: meshDefinition,
		primitive,
		primitiveIndex
	};
	return mesh;
}
