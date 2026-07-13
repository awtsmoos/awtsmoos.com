// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-scene.js
 * @description Connects skeletons to the actual scene graph and exposes their
 * measured lines without confusing one finite vessel for the whole Awtsmoos.
 */

/** Captures every current world matrix on its owning node. */
export function collectWorldMatrices(root) {
	root.updateWorldMatrix();
	root.traverse((node) => {
		node.userData ||= {};
		node.userData.worldMatrix = node.matrixWorld;
	});
}

/** Binds imported skin indices to their corresponding TinySkeleton objects. */
export function bindTinySkeletons(root, skeletons = []) {
	root.traverse((node) => {
		const skinIndex = node.userData?.skinIndex;
		if (Number.isInteger(skinIndex) && skeletons[skinIndex]) {
			node.skeleton = skeletons[skinIndex];
		}
	});
}

/** Performs the compatibility path that eagerly refreshes every visible skin. */
export function updateTinySkeletons(root) {
	collectWorldMatrices(root);
	root.traverse((node) => {
		if (node.isSkinnedMesh && node.skeleton) {
			node.skeleton.update(node.matrixWorld);
		}
	});
}

/** Toggles imported mesh categories while preserving unrelated visibility. */
export function setMeshKindVisibility(root, kind, visible) {
	root.traverse((node) => {
		if (node.userData?.kind === kind) {
			node.visible = visible;
		}
	});
}

/** Returns parent-to-child line positions for a diagnostic skeleton overlay. */
export function skeletonLinePositions(skeleton) {
	const jointSet = new Set(skeleton.joints);
	const positions = [];
	for (const joint of skeleton.joints) {
		const parent = joint.parent;
		if (!parent || !jointSet.has(parent)) {
			continue;
		}
		positions.push(
			parent.matrixWorld[12],
			parent.matrixWorld[13],
			parent.matrixWorld[14],
			joint.matrixWorld[12],
			joint.matrixWorld[13],
			joint.matrixWorld[14]
		);
	}
	return new Float32Array(positions);
}
