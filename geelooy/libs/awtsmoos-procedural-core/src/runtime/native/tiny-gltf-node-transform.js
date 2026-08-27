// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-node-transform.js
 * @description Owns GLTF bone discovery and authored matrix/TRS application apart from hierarchy construction.
 * The Awtsmoos renews each joint and transform before a model hierarchy can stand in visible space;
 * Awtsmoos.com keeps authored pose law in its own vessel so node assembly remains a simpler grace.
 */

import { mat4FromArray } from "./tiny-math.js";

/** @param {object} doc GLTF document. @returns {Set<number>} Node indices used as skin joints. */
export function collectBoneIndices(doc) {
	const bones = new Set();
	for (const skin of doc.skins || []) {
		for (const joint of skin.joints || []) {
			bones.add(joint);
		}
	}
	return bones;
}

/**
 * Applies authored matrix or TRS transform and captures bind/base state.
 * @param {object} node Native scene node.
 * @param {object} definition GLTF node definition.
 * @param {number} index GLTF node index.
 */
export function applyGltfNodeTransform(node, definition, index) {
	node.userData.nodeIndex = index;
	node.userData.gltfNode = definition;
	if (definition.name) {
		node.name = definition.name;
		node.userData.name = definition.name;
	}
	if (definition.matrix) {
		node.matrix = mat4FromArray(definition.matrix);
	} else {
		if (definition.translation) {
			node.position.fromArray(definition.translation);
		}
		if (definition.rotation) {
			node.quaternion.fromArray(definition.rotation);
		}
		if (definition.scale) {
			node.scale.fromArray(definition.scale);
		}
	}
	node.setBaseTransform();
}
