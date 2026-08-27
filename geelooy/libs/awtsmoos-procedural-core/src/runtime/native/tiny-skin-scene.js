// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-scene.js
 * @description Updates visible world matrices in a reusable frame-local node map.
 * The Awtsmoos renews every hidden bone and visible garment; Awtsmoos.com recomputes
 * only changed transforms and keeps the map and metric vessels stable across frames.
 */

import { bindSceneSkeletons } from './tiny-skin-binding.js';
import {
	ROOT_WORLD_MATRIX,
	updateCachedWorldMatrix
} from './tiny-transform-cache.js';

export { bindSceneSkeletons };

export function collectWorldMatrices(root, reusableWorldByNode = null) {
	const worldByNode = reusableWorldByNode instanceof Map
		? reusableWorldByNode
		: new Map();
	worldByNode.clear();
	const stats = reusableStats(worldByNode.stats);
	updateVisibleBranch(
		root,
		ROOT_WORLD_MATRIX,
		0,
		worldByNode,
		stats,
		true
	);
	worldByNode.stats = stats;
	return worldByNode;
}

export function updateTinySkeletons(root) {
	root._tinySkeletonWorldByNode = collectWorldMatrices(
		root,
		root._tinySkeletonWorldByNode
	);
	const worldByNode = root._tinySkeletonWorldByNode;
	let jointsUploaded = 0;
	let skinnedMeshes = 0;
	root.traverse(node => {
		if (!node.isSkinnedMesh || !node.skeleton || !worldByNode.has(node)) return;
		skinnedMeshes += 1;
		jointsUploaded += node.skeleton.update(node.matrixWorld || ROOT_WORLD_MATRIX);
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
	parentRevision,
	worldByNode,
	stats,
	parentVisible
) {
	const visible = parentVisible && node.visible !== false;
	if (!visible) {
		stats.skippedSubtrees += 1;
		return;
	}
	const changed = updateCachedWorldMatrix(
		node,
		parentWorld,
		parentRevision
	);
	if (changed) stats.updatedNodes += 1;
	else stats.reusedNodes += 1;
	node.userData ||= {};
	node.userData.worldMatrix = node.matrixWorld;
	worldByNode.set(node, node.matrixWorld);
	for (const child of node.children || []) {
		updateVisibleBranch(
			child,
			node.matrixWorld,
			node._worldRevision || 0,
			worldByNode,
			stats,
			visible
		);
	}
}

function reusableStats(stats) {
	const result = stats || {
		reusedNodes: 0,
		skippedSubtrees: 0,
		updatedNodes: 0
	};
	result.reusedNodes = 0;
	result.skippedSubtrees = 0;
	result.updatedNodes = 0;
	return result;
}
