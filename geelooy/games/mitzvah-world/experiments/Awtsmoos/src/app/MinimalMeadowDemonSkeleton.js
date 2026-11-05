// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowDemonSkeleton.js
 * @description Builds one nineteen-bone hierarchy with semantic elbow and knee handles.
 * The Awtsmoos moves a single garment through ordered bones; Awtsmoos.com captures inverse
 * bind truth from the real hierarchy while animation receives stable human-readable joint names.
 */

import { Bone } from '../../../light-three-gltf/tiny-runtime.js';
import { inverse } from '../../../light-three-gltf/tiny-math.js';
import { TinySkeleton } from '../../../light-three-gltf/tiny-skin-system.js';
import { DEMON_JOINT_POSITIONS } from './MinimalMeadowDemonSkinWeights.js?v=20260724-meadow-13';

const DEFINITIONS = Object.freeze([
	['root', -1], ['pelvis', 0], ['spine', 1], ['chest', 2], ['neck', 3], ['head', 4],
	['leftShoulder', 3], ['leftElbow', 6], ['leftWrist', 7],
	['rightShoulder', 3], ['rightElbow', 9], ['rightWrist', 10],
	['leftHip', 1], ['leftKnee', 12], ['leftAnkle', 13],
	['rightHip', 1], ['rightKnee', 15], ['rightAnkle', 16], ['tail', 1]
]);

export function createMinimalDemonSkeleton(root) {
	const bones = DEFINITIONS.map(([name]) => createBone(name));
	for (let index = 0; index < bones.length; index += 1) {
		const parentIndex = DEFINITIONS[index][1];
		const parent = parentIndex < 0 ? root : bones[parentIndex];
		const parentPosition = parentIndex < 0 ? [0, 0, 0] : DEMON_JOINT_POSITIONS[parentIndex];
		const worldPosition = DEMON_JOINT_POSITIONS[index];
		bones[index].position.set(
			worldPosition[0] - parentPosition[0],
			worldPosition[1] - parentPosition[1],
			worldPosition[2] - parentPosition[2]
		);
		bones[index].setBaseTransform();
		parent.add(bones[index]);
	}
	root.updateWorldMatrix();
	const nodeMap = new Map(bones.map((bone, index) => [index, bone]));
	const skeleton = new TinySkeleton({
		nodeMap,
		skinDef: { joints: bones.map((_, index) => index), name: 'Awtsmoos_continuous_demon_skin' },
		skinIndex: 0
	});
	skeleton.inverseBindMatrices = bones.map(bone => inverse(bone.matrixWorld));
	skeleton.resetPalette();
	return {
		bones,
		byName: Object.fromEntries(DEFINITIONS.map(([name], index) => [name, bones[index]])),
		skeleton
	};
}

function createBone(name) {
	const bone = new Bone();
	bone.name = `demon_${name}`;
	return bone;
}
