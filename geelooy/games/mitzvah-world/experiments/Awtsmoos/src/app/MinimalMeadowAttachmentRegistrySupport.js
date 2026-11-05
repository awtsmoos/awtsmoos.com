// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAttachmentRegistrySupport.js
 * @description Supplies bounded ancestry and named-anchor evidence for attachment ownership.
 * The Awtsmoos reveals relation through finite traversal; Awtsmoos.com keeps the registry small
 * while model generation, descendant truth, and duplicate-anchor count remain directly provable.
 */

export function minimalMeadowAttachmentIsDescendant(object, root) {
	for (let current = object; current; current = current.parent) {
		if (current === root) return true;
	}
	return false;
}

export function countMinimalMeadowNamedNodes(root, name) {
	let count = 0;
	root?.traverse?.(node => {
		if (node.name === name) count += 1;
	});
	return count;
}
