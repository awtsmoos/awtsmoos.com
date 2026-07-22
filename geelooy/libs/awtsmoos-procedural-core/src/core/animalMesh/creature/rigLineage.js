// B"H
// Boruch Hashem
// Blessed is He

/**
 * Compares consecutive Yetzirah rigs by semantic source and role. Stable IDs are
 * preserved whenever the anatomy survives; every loss or rebirth is named rather
 * than hidden, for Hod must report what the changing vessel could not retain.
 * @param {Object|null} previousRig - Earlier YetzirahRig.
 * @param {Object} nextRig - Newly synthesized YetzirahRig.
 * @returns {Object} Preserved, remapped, added, and removed bone lineage.
 * @complexity O(b), where b is total bone count.
 * @deterministic Always.
 * @sideEffects None.
 */
export function createRigLineageReport(previousRig, nextRig) {
	const previousBones = previousRig?.bones || [];
	const nextBySourceRole = new Map(nextRig.bones.map((bone) => [`${bone.sourceAnatomyId}|${bone.semanticRole}`, bone]));
	const previousBySourceRole = new Map(previousBones.map((bone) => [`${bone.sourceAnatomyId}|${bone.semanticRole}`, bone]));
	const preserved = [];
	const remapped = [];
	const removed = [];
	const added = [];
	for (const previousBone of previousBones) {
		const key = `${previousBone.sourceAnatomyId}|${previousBone.semanticRole}`;
		const nextBone = nextBySourceRole.get(key);
		if (!nextBone) {
			removed.push({ boneId: previousBone.id, sourceAnatomyId: previousBone.sourceAnatomyId });
		} else if (nextBone.id === previousBone.id) {
			preserved.push(previousBone.id);
		} else {
			remapped.push({ fromBoneId: previousBone.id, toBoneId: nextBone.id, sourceAnatomyId: previousBone.sourceAnatomyId });
		}
	}
	for (const nextBone of nextRig.bones) {
		const key = `${nextBone.sourceAnatomyId}|${nextBone.semanticRole}`;
		if (!previousBySourceRole.has(key)) {
			added.push({ boneId: nextBone.id, sourceAnatomyId: nextBone.sourceAnatomyId });
		}
	}
	return { preserved, remapped, added, removed };
}

export function compareYetzirahRigs(firstRig, secondRig) {
	const lineage = createRigLineageReport(firstRig, secondRig);
	return {
		equal: firstRig.contentHash === secondRig.contentHash,
		boneCountDelta: secondRig.bones.length - firstRig.bones.length,
		lineage
	};
}
