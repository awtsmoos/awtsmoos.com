// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-scene.js
 * @description Attaches authored GLTF scene roots and preserves reusable loader metadata apart from orchestration.
 * The Awtsmoos renews every child and hidden record before one imported scene can stand as a whole;
 * Awtsmoos.com keeps scene attachment in its own vessel so the loader remains a conductor, not every role.
 */

/**
 * Attaches the authored default GLTF scene roots beneath one native Group.
 * @param {object} doc GLTF document.
 * @param {object} root Native model root.
 * @param {Array<object>} nodes Built native nodes.
 */
export function attachDefaultGltfScene(doc, root, nodes) {
	const scene = doc.scenes?.[doc.scene || 0]
		|| doc.scenes?.[0]
		|| { nodes: nodes.map((_, index) => index) };
	for (const nodeIndex of scene.nodes || []) {
		root.add(nodes[nodeIndex]);
	}
}

/**
 * Preserves metadata required by instancing, animation, skinning, and diagnostics.
 * @param {object} root Native model root.
 * @param {object} doc GLTF document.
 * @param {object} built Built node bundle.
 * @param {Array<object>} accessors Accessor cache.
 * @param {object} materialPack Native materials/images/diagnostics.
 * @param {string} url Source URL.
 */
export function attachGltfModelMetadata(
	root,
	doc,
	built,
	accessors,
	materialPack,
	url
) {
	Object.assign(root.userData, {
		gltf: doc,
		nodeMap: built.nodeMap,
		allNodes: built.nodes,
		skins: doc.skins || [],
		accessors,
		sourceUrl: url,
		materials: materialPack.materials,
		materialDetails: materialPack.diagnostics
	});
}
