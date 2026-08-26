// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkinInfluencePolicy.js
 * @description Selects anatomy-aware bone neighborhoods and physical skin envelopes before geometric weighting begins.
 * RESPONSIBILITY: keep semantic lineage first, then derive capsule radii from quality plus optional physical bone morphology.
 * NON-RESPONSIBILITY: this module does not rank individual vertices, mutate rigs, or change influence-array widths.
 * The Awtsmoos joins bone beneath flesh without confusion; Awtsmoos.com lets semantic lineage speak first, while measured physical envelopes soften joints without stealing weight across the body.
 */

const BODY_ROLES = new Set([
	'locomotion.root',
	'axial.spine',
	'axial.neck-head'
]);

/**
 * Returns deterministic candidate bones with semantic priority and hierarchy continuity.
 * @param {object} mesh Semantic mesh or region record.
 * @param {object} rig Yetzirah rig containing stable bone lineage.
 * @returns {Array<object>} Ordered immutable influence candidates.
 */
export function selectSkinInfluenceCandidates(mesh, rig) {
	const regions = semanticRegions(mesh);
	const bodyRegion = [...regions].some(region => region.startsWith('body.'));
	const direct = [];
	for (let boneIndex = 0; boneIndex < rig.bones.length; boneIndex += 1) {
		const bone = rig.bones[boneIndex];
		if (matchesRegion(bone, regions, bodyRegion)) {
			direct.push(candidate(bone, boneIndex, 1, 'direct'));
		}
	}
	if (!direct.length) {
		return rig.bones.map((bone, boneIndex) => {
			return candidate(bone, boneIndex, 0.38, 'fallback');
		});
	}
	return includeHierarchyNeighbors(rig.bones, direct);
}

/**
 * Resolves an anatomy-scaled capsule radius and falloff for one selected bone.
 * Physical profiles are additive: old rigs without them retain historical behavior.
 * @param {object} candidate Selected bone candidate.
 * @param {object} options Skin quality and optional envelope overrides.
 * @returns {object} Frozen radius, falloff, priority, and joint-gain contract.
 */
export function skinEnvelopeFor(candidate, options = {}) {
	const quality = qualityEnvelope(options.quality);
	const physical = candidate.bone.physicalProfile?.influenceEnvelope || {};
	const radialMultiplier = positive(physical.radialMultiplier, 1);
	const lengthRatio = positive(physical.lengthRadiusRatio, quality.length);
	return Object.freeze({
		falloff: positive(options.falloff, quality.falloff),
		jointGain: positive(physical.jointGain, 1),
		priority: candidate.priority,
		radius: Math.max(
			0.02,
			Number(candidate.bone.radius || 0) * quality.radius * radialMultiplier,
			Number(candidate.bone.length || 0) * lengthRatio
		)
	});
}

/** Converts mesh identity and semantic region aliases into one lowercase set. */
function semanticRegions(mesh) {
	return new Set([
		mesh.id,
		...(mesh.semanticRegionIds || [])
	].filter(Boolean).map(value => String(value).toLowerCase()));
}

/** Adds direct parent and child bones while preserving the historical priorities. */
function includeHierarchyNeighbors(bones, direct) {
	const byId = new Map(bones.map((bone, boneIndex) => [bone.id, { bone, boneIndex }]));
	const selected = new Map(direct.map(entry => [entry.boneIndex, entry]));
	for (const entry of direct) {
		addNeighbor(selected, byId.get(entry.bone.parentBoneId), 0.72, 'parent');
		bones.forEach((bone, boneIndex) => {
			if (bone.parentBoneId === entry.bone.id) {
				addNeighbor(selected, { bone, boneIndex }, 0.66, 'child');
			}
		});
	}
	return [...selected.values()].sort((left, right) => left.boneIndex - right.boneIndex);
}

/** Tests bone semantic identities against requested regions or generic body roles. */
function matchesRegion(bone, regions, bodyRegion) {
	const identities = [bone.id, bone.sourceAnatomyId, bone.skinningRegion, bone.semanticRole]
		.filter(Boolean)
		.map(value => String(value).toLowerCase());
	if (identities.some(identity => regions.has(identity))) {
		return true;
	}
	return bodyRegion && BODY_ROLES.has(String(bone.semanticRole || '').toLowerCase());
}

/** Creates one immutable candidate record. */
function candidate(bone, boneIndex, priority, relationship) {
	return Object.freeze({ bone, boneIndex, priority, relationship });
}

/** Adds one hierarchy neighbor unless a stronger/direct entry already exists. */
function addNeighbor(selected, neighbor, priority, relationship) {
	if (!neighbor || selected.has(neighbor.boneIndex)) {
		return;
	}
	selected.set(neighbor.boneIndex, candidate(neighbor.bone, neighbor.boneIndex, priority, relationship));
}

/** Returns the historical quality envelope constants. */
function qualityEnvelope(quality = 'balanced') {
	if (quality === 'high') {
		return { falloff: 2.35, length: 0.19, radius: 2.6 };
	}
	if (quality === 'fast') {
		return { falloff: 2.9, length: 0.11, radius: 1.85 };
	}
	return { falloff: 2.55, length: 0.15, radius: 2.2 };
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
