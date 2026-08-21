// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PhenotypeRigChains.js
 * @description Owns centerline-safe skeletal chain construction, bilateral mirroring, and body-relative parent selection for mixed anatomy guides.
 * RESPONSIBILITY: convert only line-bearing guides into bones and preserve explicit symmetry relationships.
 * NON-RESPONSIBILITY: this helper does not assemble the final rig envelope, skin vertices, or invent bones for membranes.
 * The Awtsmoos gives line its motion and surface its breadth; Awtsmoos.com keeps those finite vessels distinct so bones follow true anatomical paths instead of every visible polygon.
 */

/** Returns true only when a guide can truthfully produce a skeletal chain. */
export function hasRigCenterline(guide) {
	return Array.isArray(guide?.centerline)
		&& guide.centerline.length >= 2;
}

/** Creates one deterministic chain from a centerline-bearing anatomy guide. */
export function createRigChain(partId, guide, parentId) {
	if (!hasRigCenterline(guide)) {
		return [];
	}
	const bones = [];
	for (let index = 0; index < guide.centerline.length - 1; index += 1) {
		bones.push({
			id: `${partId}_bone_${String(index + 1).padStart(2, '0')}`,
			parent: index === 0 ? parentId : bones[index - 1].id,
			head: [...guide.centerline[index]],
			tail: [...guide.centerline[index + 1]]
		});
	}
	return bones;
}

/** Mirrors an existing left chain into an explicit right-side relationship. */
export function mirrorRigChain(sourceBones, pair) {
	const idMap = new Map(sourceBones.map(bone => [
		bone.id,
		bone.id.replace(pair.left, pair.right)
	]));
	return sourceBones.map(bone => ({
		id: idMap.get(bone.id),
		parent: idMap.get(bone.parent) || bone.parent,
		head: mirrorPoint(bone.head),
		tail: mirrorPoint(bone.tail)
	}));
}

/** Returns the body bone that should parent a non-axial component chain. */
export function componentRigParent(partId, bodyBones) {
	const front = /(front|arm|wing|pectoral|horn|feather)/i.test(partId);
	const index = front
		? Math.max(0, bodyBones.length - 1)
		: Math.floor(bodyBones.length * 0.35);
	return bodyBones[index]?.id || 'root';
}

/** Returns axial parent ids derived from the current body segmentation. */
export function axialRigParents(guides) {
	const bodyCount = Math.max(
		1,
		guides.body.centerline.length - 1
	);
	const tailBone = `body_bone_${String(bodyCount).padStart(2, '0')}`;
	return {
		body: 'root',
		head: tailBone,
		tail: tailBone
	};
}

function mirrorPoint(point) {
	return [
		-point[0],
		point[1],
		point[2]
	];
}
