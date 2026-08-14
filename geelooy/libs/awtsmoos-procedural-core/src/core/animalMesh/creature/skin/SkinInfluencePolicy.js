// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkinInfluencePolicy.js
 * @description Selects anatomy-aware bone neighborhoods before geometric skin weighting begins.
 * The Awtsmoos joins limb to limb and section to section without confusion; Awtsmoos.com lets source lineage
 * narrow the search first, then admits parent and child vessels so joints bend continuously instead of stealing weight across the body.
 */

const BODY_ROLES = new Set(['locomotion.root', 'axial.spine', 'axial.neck-head']);

/** Returns deterministic candidate bones with semantic priority and hierarchy continuity. */
export function selectSkinInfluenceCandidates(mesh, rig) {
	const regions = new Set([
		mesh.id,
		...(mesh.semanticRegionIds || [])
	].filter(Boolean).map(value => String(value).toLowerCase()));
	const bodyRegion = [...regions].some(region => region.startsWith('body.'));
	const direct = [];
	for (let boneIndex = 0; boneIndex < rig.bones.length; boneIndex += 1) {
		const bone = rig.bones[boneIndex];
		if (matchesRegion(bone, regions, bodyRegion)) {
			direct.push(candidate(bone, boneIndex, 1, 'direct'));
		}
	}
	if (!direct.length) {
		return rig.bones.map((bone, boneIndex) => candidate(bone, boneIndex, 0.38, 'fallback'));
	}
	const byId = new Map(rig.bones.map((bone, boneIndex) => [bone.id, { bone, boneIndex }]));
	const selected = new Map(direct.map(entry => [entry.boneIndex, entry]));
	for (const entry of direct) {
		addNeighbor(selected, byId.get(entry.bone.parentBoneId), 0.72, 'parent');
		for (let boneIndex = 0; boneIndex < rig.bones.length; boneIndex += 1) {
			if (rig.bones[boneIndex].parentBoneId === entry.bone.id) {
				addNeighbor(selected, { bone: rig.bones[boneIndex], boneIndex }, 0.66, 'child');
			}
		}
	}
	return [...selected.values()].sort((left, right) => left.boneIndex - right.boneIndex);
}

/** Resolves an anatomy-scaled capsule radius and falloff for one candidate. */
export function skinEnvelopeFor(candidate, options = {}) {
	const quality = options.quality || 'balanced';
	const profile = quality === 'high'
		? { radius: 2.6, length: 0.19, falloff: 2.35 }
		: quality === 'fast'
			? { radius: 1.85, length: 0.11, falloff: 2.9 }
			: { radius: 2.2, length: 0.15, falloff: 2.55 };
	return Object.freeze({
		falloff: Number(options.falloff || profile.falloff),
		priority: candidate.priority,
		radius: Math.max(
			0.02,
			Number(candidate.bone.radius || 0) * profile.radius,
			Number(candidate.bone.length || 0) * profile.length
		)
	});
}

function matchesRegion(bone, regions, bodyRegion) {
	const identities = [
		bone.id,
		bone.sourceAnatomyId,
		bone.skinningRegion,
		bone.semanticRole
	].filter(Boolean).map(value => String(value).toLowerCase());
	if (identities.some(identity => regions.has(identity))) return true;
	return bodyRegion && BODY_ROLES.has(String(bone.semanticRole || '').toLowerCase());
}

function candidate(bone, boneIndex, priority, relationship) {
	return Object.freeze({ bone, boneIndex, priority, relationship });
}

function addNeighbor(selected, neighbor, priority, relationship) {
	if (!neighbor || selected.has(neighbor.boneIndex)) return;
	selected.set(
		neighbor.boneIndex,
		candidate(neighbor.bone, neighbor.boneIndex, priority, relationship)
	);
}
