// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-object3d-hierarchy.js
 * @description Owns native child attachment, removal, lookup, parent detachment, and preorder traversal.
 * The Awtsmoos renews parent and child as one revealed tree before hierarchy can gather in sight;
 * Awtsmoos.com keeps structural mutation and discovery in one vessel so Object3D may remain a smaller light.
 */

import { markSceneGraphChanged } from "./tiny-scene-revision.js";
import { invalidateTransformCache } from "./tiny-transform-cache.js";

/**
 * Attaches one child beneath a native parent.
 * @param {object} parent Native parent node.
 * @param {object} child Native child node.
 * @returns {object} Parent node.
 */
export function attachNativeChild(parent, child) {
	if (!child) return parent;
	if (child.parent) {
		child.parent.remove(child);
	}
	child.parent = parent;
	invalidateTransformCache(child);
	parent.children.push(child);
	markSceneGraphChanged(parent);
	return parent;
}

/**
 * Removes one child from a native parent.
 * @param {object} parent Native parent node.
 * @param {object} child Native child node.
 * @returns {object} Parent node.
 */
export function removeNativeChild(parent, child) {
	const index = parent.children.indexOf(child);
	if (index < 0) return parent;
	parent.children.splice(index, 1);
	markSceneGraphChanged(parent);
	child.parent = null;
	invalidateTransformCache(child);
	return parent;
}

/**
 * Detaches one node from its current parent when present.
 * @param {object} object Native object node.
 * @returns {object} Detached node.
 */
export function removeNativeFromParent(object) {
	object.parent?.remove(object);
	return object;
}

/**
 * Finds one named object recursively.
 * @param {object} root Native hierarchy root.
 * @param {string} name Object name.
 * @returns {object|null} Matching node when found.
 */
export function findNativeObjectByName(root, name) {
	if (root.name === name) return root;
	for (const child of root.children) {
		const match = findNativeObjectByName(child, name);
		if (match) return match;
	}
	return null;
}

/**
 * Visits one native hierarchy in preorder.
 * @param {object} root Native root node.
 * @param {Function} visitor Visitor callback.
 */
export function traverseNativeHierarchy(root, visitor) {
	visitor(root);
	for (const child of root.children) {
		child.traverse(visitor);
	}
}
