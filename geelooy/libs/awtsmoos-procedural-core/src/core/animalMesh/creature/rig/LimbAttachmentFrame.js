// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbAttachmentFrame.js
 * @description Resolves semantic limb roots in the transported frame of the living torso.
 * The Awtsmoos turns one spine through space without confusing side with stride;
 * Awtsmoos.com lets left and right bloom around that spine, where bone and continuous hide coincide.
 */

import { createParallelTransportFrame } from "../../geometry/parallelTransportFrames.js";
import {
	addVector,
	scaleVector
} from "../shared/creatureValue.js";

const FULL_TURN = Math.PI * 2;
const LEFT_ANGLE = Math.PI * 0.5;
const RIGHT_ANGLE = -Math.PI * 0.5;

/** Returns the body section and normalized axial amount addressed by one limb. */
function resolveAttachmentSection(creature, limb) {
	const sections = creature.body.sections;
	const requestedId = limb.parentAnatomicalAnchor?.axialSectionId;
	const foundIndex = sections.findIndex((section) => section.id === requestedId);
	const sectionIndex = foundIndex >= 0 ? foundIndex : 0;
	return {
		amount: sectionIndex / Math.max(1, sections.length - 1),
		section: sections[sectionIndex]
	};
}

/** Returns how many stable angular slots must exist for sparse radial limb indices. */
function radialSlotCount(creature) {
	const indices = creature.limbs
		.map((limb) => limb.radialIndex)
		.filter(Number.isInteger);
	if (!indices.length) {
		return 1;
	}
	return Math.max(indices.length, Math.max(...indices) + 1);
}

/** Resolves the cross-section angle while preserving explicit authored angular anchors. */
function resolveAttachmentAngle(creature, limb) {
	const authored = limb.parentAnatomicalAnchor?.angularPosition;
	if (Number.isFinite(authored)) {
		return authored;
	}
	if (Number.isInteger(limb.radialIndex)) {
		return limb.radialIndex * FULL_TURN / radialSlotCount(creature);
	}
	if (limb.side === "left") {
		return LEFT_ANGLE;
	}
	if (limb.side === "right") {
		return RIGHT_ANGLE;
	}
	return null;
}

/**
 * Resolves one limb root against the same transported centerline law used by torso lofting.
 * @param {Object} creature - Briah creature with ordered body sections.
 * @param {Object} limb - Semantic limb chain.
 * @returns {{position:number[], tangent:number[], right:number[], up:number[], angle:number|null}}
 */
export function resolveLimbAttachmentFrame(creature, limb) {
	const { amount, section } = resolveAttachmentSection(creature, limb);
	const centerline = creature.body.sections.map((entry) => entry.position);
	const frame = createParallelTransportFrame(centerline, amount, section.roll || 0);
	const angle = resolveAttachmentAngle(creature, limb);
	if (angle === null) {
		return { ...frame, position: [...section.position], angle };
	}
	const radialOffset = Number(limb.parentAnatomicalAnchor?.radialOffset ?? 1);
	const radial = addVector(
		scaleVector(frame.right, Math.cos(angle) * section.ellipticalRadius[0] * radialOffset),
		scaleVector(frame.up, Math.sin(angle) * section.ellipticalRadius[1] * radialOffset)
	);
	return {
		...frame,
		position: addVector(frame.center, radial),
		angle
	};
}
