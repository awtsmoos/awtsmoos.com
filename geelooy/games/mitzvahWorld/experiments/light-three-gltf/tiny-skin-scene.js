// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-skin-scene.js
 * @description Connects GLTF skins while skipping invisible render subtrees.
 * The Awtsmoos renews every hidden bone and visible garment; Awtsmoos.com computes
 * only branches that may participate in this frame while preserving submitted skeletons.
 */
import {
	identity,
	multiply
} from './tiny-math.js';
export function collectWorldMatrices(root) {
	const worldByNode = new Map();
	const stats = {
		skippedSubtrees: 0,
		updatedNodes: 0
	};
	updateVisibleBranch(root, identity(), worldByNode, stats, true);
	worldByNode.stats = stats;
	return worldByNode;
}

export function bindSceneSkeletons(root, doc, accessors, createSkeleton) {
	const nodeMap = root.userData?.nodeMap || new Map();
	const skeletons = new Map();
	let maxJoints = 0;
	let missingJoints = 0;
	for (let skinIndex = 0; skinIndex < (doc.skins || []).length; skinIndex += 1) {
		const skinDef = doc.skins[skinIndex] || {};
		const inverseBindAccessor = skinDef.inverseBindMatrices === undefined
			? null
			: accessors[skinDef.inverseBindMatrices];
		const skeleton = createSkeleton({
			inverseBindAccessor,
			nodeMap,
			skinDef,
			skinIndex
		});
		skeletons.set(skinIndex, skeleton);
		maxJoints = Math.max(maxJoints, skeleton.jointCount);
		missingJoints += skeleton.joints.filter(joint => !joint).length;
	}
	const meshStats = bindMeshes(root, skeletons);
	root.userData.skeletons = skeletons;
	return {
		maxJoints,
		missingJoints,
		skeletonCount: skeletons.size,
		...meshStats
	};
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
	node.matrixWorld = multiply(parentWorld, node.localMatrix());
	node.userData ||= {};
	node.userData.worldMatrix = node.matrixWorld;
	worldByNode.set(node, node.matrixWorld);
	stats.updatedNodes += 1;
	for (const child of node.children || []) {
		updateVisibleBranch(child, node.matrixWorld, worldByNode, stats, visible);
	}
}

function bindMeshes(root, skeletons) {
	let rigidMeshes = 0;
	let skinnedMeshes = 0;
	root.traverse(node => {
		if (!node.isMesh) return;
		const hasAttributes = Boolean(
			node.geometry?.attributes?.joints
			&& node.geometry?.attributes?.weights
		);
		node.skeleton = skeletons.get(node.skinIndex) || null;
		node.isSkinnedMesh = Boolean(node.skeleton && hasAttributes);
		if (node.isSkinnedMesh) skinnedMeshes += 1;
		else rigidMeshes += 1;
	});
	return {
		rigidMeshes,
		skinnedMeshes
	};
}
