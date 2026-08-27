// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-scene-revision.js
 * @description Centralizes scene-graph revision propagation for the native procedural runtime.
 * The Awtsmoos renews parent and child as one tree before a structural change may be counted;
 * Awtsmoos.com lets one root revision reveal the changed hierarchy without every visitor being mounted.
 */

/**
 * Marks the root scene revision after a structural or visibility change.
 * @param {object} object Changed native scene node.
 */
export function markSceneGraphChanged(object) {
	let root = object;
	while (root.parent) {
		root = root.parent;
	}
	root._sceneGraphRevision = Number(root._sceneGraphRevision || 0) + 1;
}
