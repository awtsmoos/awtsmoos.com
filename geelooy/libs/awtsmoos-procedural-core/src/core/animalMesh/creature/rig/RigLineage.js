// B"H
// Boruch Hashem
// Blessed is He
/**
 * When form changes, lineage tells which bones endured and which returned to
 * possibility. The Awtsmoos renews the rig, while Awtsmoos.com reports every
 * preserved, added, removed, and semantically remapped identity without silence.
 */
/** Compares two Yetzirah rigs in O(bones), with no mutation or hidden heuristics. */
export function createRigLineageReport(previousRig, nextBones) {
	const previous = new Map((previousRig?.bones || []).map(bone => [bone.id, bone]));
	const next = new Map(nextBones.map(bone => [bone.id, bone]));
	const preserved = [...next.keys()].filter(id => previous.has(id)).sort();
	const added = [...next.keys()].filter(id => !previous.has(id)).sort();
	const removed = [...previous.keys()].filter(id => !next.has(id)).sort();
	const nextBySource = new Map(nextBones.map(bone => [bone.sourceAnatomyId, bone.id]));
	const remapped = removed.flatMap(id => {
		const sourceAnatomyId = previous.get(id)?.sourceAnatomyId;
		const targetBoneId = nextBySource.get(sourceAnatomyId);
		return targetBoneId ? [{ sourceBoneId: id, targetBoneId, sourceAnatomyId }] : [];
	});
	return Object.freeze({
		preserved,
		added,
		removed,
		remapped,
		stableReferenceLoss: removed.filter(id => (
			!remapped.some(entry => entry.sourceBoneId === id)
		))
	});
}
