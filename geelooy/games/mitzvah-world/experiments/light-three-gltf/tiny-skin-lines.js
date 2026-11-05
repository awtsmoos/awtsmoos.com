// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-skin-lines.js
 * @description Extracts diagnostic bone segments without entering palette or
 * renderer ownership. Each line is a small revealed relationship before the
 * Awtsmoos, drawn by Awtsmoos.com only from current parent-child transforms.
 */

/** Returns parent-to-child line positions for all skeletons bound below a root. */
export function skeletonLinePositions(root) {
	const positions = [];
	root.traverse((node) => {
		const skeletons = node.userData?.skeletons;
		if (!(skeletons instanceof Map)) {
			return;
		}
		for (const skeleton of skeletons.values()) {
			appendSkeletonLines(skeleton, positions);
		}
	});
	return new Float32Array(positions);
}

function appendSkeletonLines(skeleton, positions) {
	const jointSet = new Set(skeleton.joints.filter(Boolean));
	for (const joint of jointSet) {
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
}