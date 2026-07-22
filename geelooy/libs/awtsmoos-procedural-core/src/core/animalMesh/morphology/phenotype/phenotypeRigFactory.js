// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos translates anatomical paths into stable chains without hiding a
 * solver. This Awtsmoos.com rig remains a plain recipe contract for the
 * established rig builder, weighting system, and external animation adapters.
 */

function mirrorPoint(point) {
	return [-point[0], point[1], point[2]];
}

function chainBones(partId, guide, parentId) {
	const bones = [];
	for (let index = 0; index < guide.centerline.length - 1; index += 1) {
		const id = `${partId}_bone_${String(index + 1).padStart(2, "0")}`;
		bones.push({
			id,
			parent: index === 0 ? parentId : bones[index - 1].id,
			head: [...guide.centerline[index]],
			tail: [...guide.centerline[index + 1]]
		});
	}
	return bones;
}

function mirroredBones(sourceBones, pair) {
	const idMap = new Map(sourceBones.map((bone) => [
		bone.id,
		bone.id.replace(pair.left, pair.right)
	]));
	return sourceBones.map((bone) => ({
		id: idMap.get(bone.id),
		parent: idMap.get(bone.parent) || bone.parent,
		head: mirrorPoint(bone.head),
		tail: mirrorPoint(bone.tail)
	}));
}

function axialParents(guides) {
	const bodyCount = Math.max(1, guides.body.centerline.length - 1);
	return {
		body: "root",
		head: `body_bone_${String(bodyCount).padStart(2, "0")}`,
		tail: `body_bone_${String(bodyCount).padStart(2, "0")}`
	};
}

function appendageParent(partId, bodyBones) {
	const front = /(front|arm|wing|pectoral)/i.test(partId);
	const index = front ? Math.max(0, bodyBones.length - 1) : Math.floor(bodyBones.length * 0.35);
	return bodyBones[index]?.id || "root";
}

export function createPhenotypeRig(profile, guides, symmetryPairs = []) {
	const roots = axialParents(guides);
	const rootTail = guides.body.centerline[0];
	const bones = [{
		id: "root",
		parent: null,
		head: [0, 0, 0],
		tail: [rootTail[0], rootTail[1], Math.max(0.1, rootTail[2] * 0.35)]
	}];
	const bodyBones = chainBones("body", guides.body, roots.body);
	bones.push(...bodyBones);
	for (const partId of ["head", "tail"]) {
		if (guides[partId]) bones.push(...chainBones(partId, guides[partId], roots[partId]));
	}
	for (const [partId, guide] of Object.entries(guides)) {
		if (["body", "head", "tail"].includes(partId)) continue;
		const chain = chainBones(partId, guide, appendageParent(partId, bodyBones));
		bones.push(...chain);
		const pair = symmetryPairs.find((entry) => entry.left === partId);
		if (pair) bones.push(...mirroredBones(chain, pair));
	}
	return {
		enabled: true,
		type: profile.archetype_id,
		bones,
		weighting: {
			method: "automatic_then_constrained_cleanup",
			maximum_influences_per_vertex: 4,
			preserve_symmetry: true,
			genome_id: profile.genome.id
		}
	};
}
