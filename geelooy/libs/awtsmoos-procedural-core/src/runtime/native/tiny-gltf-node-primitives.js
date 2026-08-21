// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-node-primitives.js
 * @description Attaches GLTF primitive meshes beneath already-created native nodes while hierarchy assembly stays focused.
 * The Awtsmoos renews each primitive before one authored node may wear its visible geometry in light;
 * Awtsmoos.com keeps mesh attachment in a separate keli so node creation and primitive counting each remain right.
 */

import { createGltfPrimitiveMesh } from "./tiny-gltf-primitive.js";

/**
 * Adds native primitive meshes beneath already-created GLTF nodes.
 * @param {object} doc GLTF document.
 * @param {Array<object>} nodes Native node list.
 * @param {Array<object>} materials Native material list.
 * @param {Function} getAccessor Cached accessor getter.
 * @param {object} stats Mutable loader statistics.
 */
export function attachGltfPrimitiveMeshes(
	doc,
	nodes,
	materials,
	getAccessor,
	stats
) {
	for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
		const definition = doc.nodes[nodeIndex] || {};
		const meshDefinition = doc.meshes?.[definition.mesh];
		if (!meshDefinition) continue;
		const primitives = meshDefinition.primitives || [];
		for (
			let primitiveIndex = 0;
			primitiveIndex < primitives.length;
			primitiveIndex += 1
		) {
			attachOnePrimitive(
				nodes[nodeIndex],
				materials,
				getAccessor,
				primitives[primitiveIndex],
				meshDefinition,
				definition,
				nodeIndex,
				primitiveIndex,
				stats
			);
		}
	}
}

/**
 * Creates, names, attaches, and counts one primitive mesh.
 * @param {object} node Native target node.
 * @param {Array<object>} materials Native material list.
 * @param {Function} getAccessor Cached accessor getter.
 * @param {object} primitive GLTF primitive definition.
 * @param {object} meshDefinition GLTF mesh definition.
 * @param {object} definition GLTF node definition.
 * @param {number} nodeIndex GLTF node index.
 * @param {number} primitiveIndex Primitive index.
 * @param {object} stats Mutable loader statistics.
 */
function attachOnePrimitive(
	node,
	materials,
	getAccessor,
	primitive,
	meshDefinition,
	definition,
	nodeIndex,
	primitiveIndex,
	stats
) {
	const mesh = createGltfPrimitiveMesh(
		materials,
		getAccessor,
		primitive,
		meshDefinition,
		definition,
		primitiveIndex
	);
	mesh.nodeIndex = nodeIndex;
	mesh.setBaseTransform();
	node.add(mesh);
	stats.meshes += 1;
	stats.primitives += 1;
	if (
		mesh.skinIndex !== null
		&& mesh.geometry.attributes.joints
		&& mesh.geometry.attributes.weights
	) {
		stats.skinnedPrimitives += 1;
	}
}
