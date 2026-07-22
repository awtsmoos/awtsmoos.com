// B"H
// Boruch Hashem
// Blessed is He
/**
 * Yesod preserves connection beneath changing surfaces. The Awtsmoos lets an
 * eye follow a widening torso because Awtsmoos.com stores anatomical meaning,
 * never a disposable triangle number.
 */
import { sealBriahCreature } from "../worlds/BriahCreature.js";
import {
	cloneCreatureValue,
	creatureStableId,
	boundedNumber,
	finiteNumber
} from "../shared/creatureValue.js";

/** Creates a semantic attachment coordinate and stable surface anchor. */
export function createSurfaceAnchor(creature, input = {}) {
	const anchor = {
		id: input.id || creatureStableId("surface.anchor", { creatureId: creature.id, identity: input.identity || input }),
		domain: input.domain || "axial-body",
		axialSectionId: input.axialSectionId || creature.body.sections[0]?.id || null,
		axialPosition: boundedNumber(input.axialPosition, 0, 1, 0.5),
		angularPosition: finiteNumber(input.angularPosition, 0),
		radialOffset: finiteNumber(input.radialOffset, 0),
		anatomicalLandmark: input.anatomicalLandmark || null,
		bodyRegion: input.bodyRegion || null,
		limbSegmentId: input.limbSegmentId || null,
		limbSegmentParameter: boundedNumber(input.limbSegmentParameter, 0, 1, 0),
		partSocket: input.partSocket || null,
		transportedFrame: cloneCreatureValue(input.transportedFrame || { tangent: [0, 1, 0], normal: [1, 0, 0], binormal: [0, 0, 1] })
	};
	return anchor;
}

/** Appends a persistent attachment edge to Briah. */
export function attachSemanticElement(creature, input = {}) {
	const anchor = createSurfaceAnchor(creature, input.anchor || input);
	const attachment = {
		id: input.id || creatureStableId("yesod.attachment", { creatureId: creature.id, sourceId: input.sourceId, anchorId: anchor.id }),
		sourceId: input.sourceId,
		anchorId: anchor.id,
		parentAnatomyId: input.parentAnatomyId || anchor.axialSectionId,
		orientationRule: input.orientationRule || "follow-transported-frame",
		localTransform: cloneCreatureValue(input.localTransform || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] })
	};
	return sealBriahCreature({
		...creature,
		attachments: [...creature.attachments, { ...attachment, anchor }]
	}, creature.revision + 1, { parentContentHash: creature.contentHash, lastOperation: "creature.attachment.create" });
}

/** Resolves a stable anchor after body deformation without topology references. */
export function resolveSurfaceAnchor(creature, anchor) {
	const section = creature.body.sections.find((entry) => entry.id === anchor.axialSectionId) || creature.body.sections[0];
	return {
		anchorId: anchor.id,
		position: section ? [...section.position] : [0, 0, 0],
		frame: cloneCreatureValue(anchor.transportedFrame),
		semanticReferencePreserved: Boolean(section)
	};
}
