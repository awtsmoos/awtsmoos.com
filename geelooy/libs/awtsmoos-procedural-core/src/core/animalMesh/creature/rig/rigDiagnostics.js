// B"H
// Boruch Hashem
// Blessed is He
/**
 * Hod explains the formed skeleton. The Awtsmoos leaves no broken parent or
 * impossible length hidden; Awtsmoos.com reports each fault by stable identity.
 */

/** Validates hierarchy, lineage, positive dimensions, and cycles. */
export function validateYetzirahRig(rig) {
	const diagnostics = [];
	const bones = rig?.bones || [];
	const boneIds = new Set(bones.map((bone) => bone.id));
	for (const bone of bones) {
		if (bone.parentBoneId && !boneIds.has(bone.parentBoneId)) {
			diagnostics.push({
				code: "RIG.PARENT_MISSING",
				severity: "error",
				boneId: bone.id,
				parentBoneId: bone.parentBoneId
			});
		}
		if (!Number.isFinite(bone.length) || bone.length <= 0) {
			diagnostics.push({
				code: "RIG.LENGTH_INVALID",
				severity: "error",
				boneId: bone.id
			});
		}
		if (!bone.sourceAnatomyId) {
			diagnostics.push({
				code: "RIG.SOURCE_MISSING",
				severity: "error",
				boneId: bone.id
			});
		}
	}
	for (const bone of bones) {
		const visited = new Set();
		let current = bone;
		while (current?.parentBoneId) {
			if (visited.has(current.id)) {
				diagnostics.push({
					code: "RIG.CYCLE",
					severity: "error",
					boneId: bone.id
				});
				break;
			}
			visited.add(current.id);
			current = bones.find(
				(entry) => entry.id === current.parentBoneId
			);
		}
	}
	return Object.freeze({
		ok: diagnostics.length === 0,
		diagnostics: Object.freeze(diagnostics),
		boneCount: bones.length,
		contactTargetCount: rig?.contactTargets?.length || 0
	});
}

/** Compares two rigs by stable bone identity and content. */
export function compareYetzirahRigs(left, right) {
	const leftIds = new Set(left?.bones?.map((bone) => bone.id) || []);
	const rightIds = new Set(right?.bones?.map((bone) => bone.id) || []);
	return Object.freeze({
		preserved: Object.freeze(
			[...leftIds].filter((id) => rightIds.has(id))
		),
		removed: Object.freeze(
			[...leftIds].filter((id) => !rightIds.has(id))
		),
		created: Object.freeze(
			[...rightIds].filter((id) => !leftIds.has(id))
		),
		contentEqual: left?.contentHash === right?.contentHash
	});
}
