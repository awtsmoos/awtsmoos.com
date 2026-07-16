// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-scene.js
 * @description Updates visible world matrices while reusing unchanged transform vessels.
 * The Awtsmoos renews every hidden bone and visible garment; Awtsmoos.com recomputes
 * only numerical transforms whose local truth or inherited parent matrix truly changed.
 */

import { identity } from './tiny-math.js';
import { bindSceneSkeletons } from './tiny-skin-binding.js';
import {
	ROOT_WORLD_MATRIX,
	updateCachedWorldMatrix
} from './tiny-transform-cache.js';

export { bindSceneSkeletons };

export function collectWorldMatrices(root) {
	const worldByNode = new Map();
	const stats = {
		reusedNodes: 0,
		skippedSubtrees: 0,
		updatedNodes: 0
	};
	updateVisibleBranch(root, ROOT_WORLD_MATRIX, worldByNode, stats, true);
	worldByNode.stats = stats;
	return worldByNode;
}

export function updateTinySkeletons(root) {
	collectWorldMatrices(root);
	let jointsUploaded = 0;
	let skinnedMeshes = 0;
	root.traverse(node => {
		if (!node.isSkinnedMesh || !node.skeleton || node.visible === false) return;
		skinnedMeshes += 1;
		jointsUploaded += node.skeleton.update(node.matrixWorld || identity());
	});
	return {
		jointsUploaded,
		skinnedMeshes
	};
}

export function setMeshKindVisibility(
	root,
	{ skinned = true, rigid = true } = {}
) {
	root.traverse(node => {
		if (!node.isMesh) return;
		node.visible = node.isSkinnedMesh ? skinned : rigid;
	});
}

function updateVisibleBranch(
	node,
	parentWorld,
	worldByNode,
	stats,
	parentVisible
) {
	const visible = parentVisible && node.visible !== false;
	if (!visible) {
		stats.skippedSubtrees += 1;
		return;
	}
	const changed = updateCachedWorldMatrix(node, parentWorld);
	if (changed) stats.updatedNodes += 1;
	else stats.reusedNodes += 1;
	node.userData ||= {};
	node.userData.worldMatrix = node.matrixWorld;
	worldByNode.set(node, node.matrixWorld);
	for (const child of node.children || []) {
		updateVisibleBranch(child, node.matrixWorld, worldByNode, stats, visible);
	}
}
