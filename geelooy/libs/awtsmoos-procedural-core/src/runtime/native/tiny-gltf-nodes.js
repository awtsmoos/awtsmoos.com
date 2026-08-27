// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-nodes.js
 * @description Builds native GLTF node vessels and hierarchy links while primitive attachment and transform law live separately.
 * The Awtsmoos renews bone, group, and child before a hidden hierarchy can stand as one visible body;
 * Awtsmoos.com keeps node assembly narrow while geometry and authored transform truth rest in their own study.
 */

import {
	Bone,
	Group
} from "./tiny-runtime.js";
import { attachGltfPrimitiveMeshes } from "./tiny-gltf-node-primitives.js";
import {
	applyGltfNodeTransform,
	collectBoneIndices
} from "./tiny-gltf-node-transform.js";

export { collectBoneIndices } from "./tiny-gltf-node-transform.js";

/**
 * Builds all native nodes, primitive children, and hierarchy links.
 * @param {object} doc GLTF document.
 * @param {Array<object>} materials Native material list.
 * @param {Function} getAccessor Cached accessor getter.
 * @param {Set<number>} bones Bone node indices.
 * @param {object} stats Mutable loader statistics.
 * @returns {object} Ordered nodes and node map.
 */
export function buildGltfNodes(
	doc,
	materials,
	getAccessor,
	bones = collectBoneIndices(doc),
	stats
) {
	const nodeMap = new Map();
	const nodes = createNodeVessels(
		doc,
		bones,
		nodeMap,
		stats
	);
	attachGltfPrimitiveMeshes(
		doc,
		nodes,
		materials,
		getAccessor,
		stats
	);
	attachNodeChildren(doc, nodes);
	return {
		nodes,
		nodeMap
	};
}

/**
 * Creates all hierarchy nodes before connecting children.
 * @param {object} doc GLTF document.
 * @param {Set<number>} bones Bone node indices.
 * @param {Map<number, object>} nodeMap Node lookup.
 * @param {object} stats Mutable loader statistics.
 * @returns {Array<object>} Native nodes.
 */
function createNodeVessels(doc, bones, nodeMap, stats) {
	const nodes = [];
	for (
		let index = 0;
		index < (doc.nodes || []).length;
		index += 1
	) {
		const definition = doc.nodes[index] || {};
		const node = bones.has(index)
			? new Bone()
			: new Group();
		applyGltfNodeTransform(
			node,
			definition,
			index
		);
		nodes[index] = node;
		nodeMap.set(index, node);
		stats.nodes += 1;
		if (definition.skin !== undefined) {
			stats.skinnedNodes += 1;
		}
	}
	return nodes;
}

/**
 * Connects native node hierarchy after every node exists.
 * @param {object} doc GLTF document.
 * @param {Array<object>} nodes Native nodes.
 */
function attachNodeChildren(doc, nodes) {
	for (let index = 0; index < nodes.length; index += 1) {
		const children = doc.nodes[index]?.children || [];
		for (const childIndex of children) {
			nodes[index].add(nodes[childIndex]);
		}
	}
}
