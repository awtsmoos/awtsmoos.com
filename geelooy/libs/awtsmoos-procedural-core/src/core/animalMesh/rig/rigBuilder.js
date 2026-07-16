// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_LIMITS
} from "../constants/animalMeshContract.js";

export function buildAnimalRig(rigInput = {}) {
	if (rigInput.enabled !== true) {
		return {
			enabled: false,
			type: rigInput.type || "none",
			bones: [],
			boneIndexById: {}
		};
	}
	const bones = rigInput.bones || [];
	if (bones.length > ANIMAL_MESH_LIMITS.maximumBones) {
		throw new Error('B"H | Rig exceeds the maximum bone count.');
	}
	const boneIndexById = {};
	bones.forEach((bone, index) => {
		if (!bone.id || bone.id in boneIndexById) {
			throw new Error('B"H | Bone ids must be present and unique.');
		}
		boneIndexById[bone.id] = index;
	});
	for (const bone of bones) {
		if (bone.parent !== null && !(bone.parent in boneIndexById)) {
			throw new Error(`B"H | Missing parent bone: ${bone.parent}`);
		}
		if (!isVector3(bone.head) || !isVector3(bone.tail)) {
			throw new Error(`B"H | Bone ${bone.id} requires head and tail vectors.`);
		}
	}
	assertNoBoneCycles(bones, boneIndexById);
	return {
		enabled: true,
		type: rigInput.type || "quadruped",
		bones: bones.map((bone) => ({
			...bone,
			head: [
				...bone.head
			],
			tail: [
				...bone.tail
			]
		})),
		boneIndexById,
		weighting: {
			method: "nearest_bone_segments",
			maximum_influences_per_vertex: 4,
			...(rigInput.weighting || {})
		}
	};
}

function assertNoBoneCycles(bones, indexById) {
	for (const bone of bones) {
		const visited = new Set();
		let current = bone;
		while (current?.parent !== null && current?.parent !== undefined) {
			if (visited.has(current.id)) {
				throw new Error(`B"H | Bone parent cycle includes ${current.id}.`);
			}
			visited.add(current.id);
			current = bones[indexById[current.parent]];
		}
	}
}

function isVector3(value) {
	return (
		Array.isArray(value) &&
		value.length === 3 &&
		value.every(Number.isFinite)
	);
}
