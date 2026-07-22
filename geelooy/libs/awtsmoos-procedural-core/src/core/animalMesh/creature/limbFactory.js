// B"H
// Boruch Hashem
// Blessed is He

import { createSemanticId } from "./identity.js";

function normalizeSegment(chainId, segment, index) {
	return {
		id: segment.id || createSemanticId("segment", chainId, index),
		length: Number(segment.length ?? 0.7),
		radiusStart: Number(segment.radiusStart ?? 0.16),
		radiusEnd: Number(segment.radiusEnd ?? 0.1),
		restDirection: [...(segment.restDirection || [0, -1, 0])],
		jointType: segment.jointType || (index === 0 ? "ball" : "hinge"),
		angularLimits: segment.angularLimits || { minimum: -1.2, maximum: 1.2 },
		preferredBendDirection: [...(segment.preferredBendDirection || [0, 0, 1])],
		twistLimits: segment.twistLimits || { minimum: -0.5, maximum: 0.5 },
		stretchLimits: segment.stretchLimits || { minimum: 0.8, maximum: 1.2 }
	};
}

/**
 * Creates one complete semantic articulated chain. The chain is a living
 * anatomical covenant, not disconnected mesh pieces; each segment can later
 * reveal a bone, skinning region, collision span, or motion responsibility.
 * @param {Object} creature - Parent Briah creature.
 * @param {Object} options - Limb role, anchor, segments, side, and capabilities.
 * @returns {Object} Stable-ID limb chain.
 */
export function createLimbChain(creature, options = {}) {
	const chainId = options.id || createSemanticId("limb", creature.id, creature.revision, creature.limbs.length, options.role, options.side, options.radialIndex);
	const segments = (options.segments || [{}, {}]).map((segment, index) => normalizeSegment(chainId, segment, index));
	return {
		id: chainId,
		parentAnatomicalAnchor: options.parentAnatomicalAnchor || options.attachmentRegion || "torso",
		functionalRole: options.role || "locomotion.support",
		side: options.side || "center",
		radialIndex: options.radialIndex ?? null,
		jointSequence: segments.map((segment, index) => ({
			id: createSemanticId("joint", chainId, index),
			type: segment.jointType,
			limits: segment.angularLimits,
			preferredBendDirection: segment.preferredBendDirection
		})),
		segments,
		contactCapabilities: [...(options.contactCapabilities || ["ground-support"])],
		manipulationCapabilities: [...(options.manipulationCapabilities || [])],
		locomotionImportance: Number(options.locomotionImportance ?? 1),
		collisionExclusions: [...(options.collisionExclusions || [])],
		symmetryRelationship: options.symmetryRelationship || null,
		endpoint: options.endpoint || (options.endPartDefinitionId ? { definitionId: options.endPartDefinitionId } : null),
		branches: []
	};
}
