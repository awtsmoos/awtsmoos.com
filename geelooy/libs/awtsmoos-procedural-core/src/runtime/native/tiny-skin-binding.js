// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-binding.js
 * @description Connects imported skin definitions to their visible mesh vessels.
 * The Awtsmoos joins bone and garment in one living form; Awtsmoos.com records that
 * relationship once so animation may unfold without rediscovering its own structure.
 */

export function bindSceneSkeletons(root, doc, accessors, createSkeleton) {
	const nodeMap = root.userData?.nodeMap || new Map();
	const skeletons = new Map();
	let maxJoints = 0;
	let missingJoints = 0;
	for (let skinIndex = 0; skinIndex < (doc.skins || []).length; skinIndex += 1) {
		const skinDefinition = doc.skins[skinIndex] || {};
		const inverseBindAccessor = skinDefinition.inverseBindMatrices === undefined
			? null
			: accessors[skinDefinition.inverseBindMatrices];
		const skeleton = createSkeleton({
			inverseBindAccessor,
			nodeMap,
			skinDef: skinDefinition,
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

function bindMeshes(root, skeletons) {
	let rigidMeshes = 0;
	let skinnedMeshes = 0;
	root.traverse(node => {
		if (!node.isMesh) return;
		const hasSkinAttributes = Boolean(
			node.geometry?.attributes?.joints
			&& node.geometry?.attributes?.weights
		);
		node.skeleton = skeletons.get(node.skinIndex) || null;
		node.isSkinnedMesh = Boolean(node.skeleton && hasSkinAttributes);
		if (node.isSkinnedMesh) skinnedMeshes += 1;
		else rigidMeshes += 1;
	});
	return {
		rigidMeshes,
		skinnedMeshes
	};
}
