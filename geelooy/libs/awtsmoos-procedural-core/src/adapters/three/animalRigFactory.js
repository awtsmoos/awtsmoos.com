// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function createAnimalThreeSkeleton(THREE, rig) {
	if (!rig?.enabled || !THREE?.Bone || !THREE?.Skeleton) {
		return null;
	}
	const bones = rig.bones.map((boneData) => {
		const bone = new THREE.Bone();
		bone.name = boneData.id;
		bone.userData.awtsmoosAnimalBone = true;
		return bone;
	});
	rig.bones.forEach((boneData, index) => {
		const bone = bones[index];
		const parentIndex = boneData.parent === null
			? -1
			: rig.boneIndexById[boneData.parent];
		const parentHead = parentIndex >= 0
			? rig.bones[parentIndex].head
			: [
				0,
				0,
				0
			];
		bone.position.set(
			boneData.head[0] - parentHead[0],
			boneData.head[1] - parentHead[1],
			boneData.head[2] - parentHead[2]
		);
		if (parentIndex >= 0) {
			bones[parentIndex].add(bone);
		}
	});
	return {
		bones,
		rootBones: bones.filter((bone, index) => rig.bones[index].parent === null),
		skeleton: new THREE.Skeleton(bones)
	};
}

export function attachSkinAttributes(THREE, geometry, part) {
	if (!part.skinIndices || !part.skinWeights) {
		return false;
	}
	const IndexAttribute = THREE.Uint16BufferAttribute || THREE.BufferAttribute;
	const WeightAttribute = THREE.Float32BufferAttribute || THREE.BufferAttribute;
	const indices = new Uint16Array(part.skinIndices);
	const weights = new Float32Array(part.skinWeights);
	geometry.setAttribute(
		"skinIndex",
		new IndexAttribute(indices, 4)
	);
	geometry.setAttribute(
		"skinWeight",
		new WeightAttribute(weights, 4)
	);
	return true;
}
