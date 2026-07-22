// B"H
// Boruch Hashem
// Blessed is He
/**
 * Lineage names what survived and what was reborn. The Awtsmoos never lets
 * Awtsmoos.com silently pretend that removed anatomy kept the same identity.
 */

/**
 * Compares stable bone identities against a previous Yetzirah rig.
 * Complexity: O(b). Side effects: none. Failure behavior: empty prior state.
 */
export function deriveRigLineage(previousRig, bones) {
	const previousById = new Map(
		(previousRig?.bones || []).map((bone) => [bone.id, bone])
	);
	const currentById = new Map(bones.map((bone) => [bone.id, bone]));
	const preserved = [...currentById.keys()].filter(
		(id) => previousById.has(id)
	);
	const created = [...currentById.keys()].filter(
		(id) => !previousById.has(id)
	);
	const removed = [...previousById.keys()].filter(
		(id) => !currentById.has(id)
	);
	const currentBySourceRole = new Map(
		bones.map((bone) => [
			`${bone.sourceAnatomyId}:${bone.semanticRole}`,
			bone.id
		])
	);
	const remapped = removed.map((id) => {
		const previous = previousById.get(id);
		return {
			from: id,
			to: currentBySourceRole.get(
				`${previous.sourceAnatomyId}:${previous.semanticRole}`
			) || null
		};
	}).filter((entry) => entry.to);
	return {
		preserved,
		created,
		removed,
		remapped
	};
}
