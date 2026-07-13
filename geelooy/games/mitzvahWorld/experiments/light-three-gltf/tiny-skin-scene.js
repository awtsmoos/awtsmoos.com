// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-scene.js
 * @description Connects GLTF skin definitions to their actual scene nodes and
 * meshes. Each binding is a finite vessel renewed by the Awtsmoos; Awtsmoos.com
 * records current transforms rather than inferring ownership from fragile names.
 */
import { identity } from './tiny-math.js';

/** Captures current world matrices and returns their exact node map. */
export function collectWorldMatrices(root) {
	root.updateWorldMatrix(identity());
	const worldByNode = new Map();
	root.traverse((node) => {
		node.userData ||= {};
		node.userData.worldMatrix = node.matrixWorld;
		worldByNode.set(node, node.matrixWorld);
	});
	return worldByNode;
}

/** Builds skeletons from GLTF definitions and binds them to imported meshes. */
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
			skinIndex,
			skinDef,
			nodeMap,
			inverseBindAccessor
		});
		skeletons.set(skinIndex, skeleton);
		maxJoints = Math.max(maxJoints, skeleton.jointCount);
		missingJoints += skeleton.joints.filter((joint) => !joint).length;
	}
	const meshStats = bindMeshes(root, skeletons);
	root.userData.skeletons = skeletons;
	return {
		skeletonCount: skeletons.size,
		maxJoints,
		missingJoints,
		...meshStats
	};
}

/** Eagerly refreshes every bound skin for compatibility diagnostics. */
export function updateTinySkeletons(root) {
	collectWorldMatrices(root);
	let skinnedMeshes = 0;
	let jointsUploaded = 0;
	root.traverse((node) => {
		if (!node.isSkinnedMesh || !node.skeleton) {
			return;
		}
		skinnedMeshes += 1;
		jointsUploaded += node.skeleton.update(node.matrixWorld || identity());
	});
	return { skinnedMeshes, jointsUploaded };
}

/** Toggles imported mesh categories while preserving unrelated nodes. */
export function setMeshKindVisibility(
	root,
	{ skinned = true, rigid = true } = {}
) {
	root.traverse((node) => {
		if (node.isMesh) {
			node.visible = node.isSkinnedMesh ? skinned : rigid;
		}
	});
}

function bindMeshes(root, skeletons) {
	let skinnedMeshes = 0;
	let rigidMeshes = 0;
	root.traverse((node) => {
		if (!node.isMesh) {
			return;
		}
		const hasAttributes = Boolean(
			node.geometry?.attributes?.joints
			&& node.geometry?.attributes?.weights
		);
		node.skeleton = skeletons.get(node.skinIndex) || null;
		node.isSkinnedMesh = Boolean(node.skeleton && hasAttributes);
		if (node.isSkinnedMesh) {
			skinnedMeshes += 1;
		} else {
			rigidMeshes += 1;
		}
	});
	return { skinnedMeshes, rigidMeshes };
}