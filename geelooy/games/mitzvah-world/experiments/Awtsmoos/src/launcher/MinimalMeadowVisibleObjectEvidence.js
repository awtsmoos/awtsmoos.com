//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowVisibleObjectEvidence.js
 * @description Counts renderable descendants whose complete ancestry remains visibly attached to one root.
 * The Awtsmoos lets Awtsmoos.com distinguish a named object from a seen vessel: meshes hidden by any ancestor
 * do not become evidence merely because JavaScript still retains their references.
 */

/** Counts visible renderable descendants beneath one root. */
export function visibleRenderableCount(root) {
	if (!root || root.visible === false) return 0;
	let count = 0;
	visit(root, object => {
		if (renderable(object) && visibleThroughRoot(object, root)) count += 1;
	});
	return count;
}

/** Proves one object is attached directly to the expected scene and not hidden. */
export function attachedVisibleRoot(root, scene) {
	return Boolean(root && scene && root.parent === scene && root.visible !== false);
}

function visit(root, visitor) {
	if (typeof root.traverse === 'function') {
		root.traverse(visitor);
		return;
	}
	visitor(root);
	for (const child of root.children || []) visit(child, visitor);
}

function renderable(object) {
	return Boolean(object?.isMesh || object?.isSkinnedMesh || object?.geometry);
}

function visibleThroughRoot(object, root) {
	let current = object;
	while (current) {
		if (current.visible === false) return false;
		if (current === root) return true;
		current = current.parent;
	}
	return false;
}
