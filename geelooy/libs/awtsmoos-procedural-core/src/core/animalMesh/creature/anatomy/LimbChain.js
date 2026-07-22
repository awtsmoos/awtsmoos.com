// B"H
// Boruch Hashem
// Blessed is He
/**
 * A limb is one articulated promise, not scattered cylinders. The Awtsmoos
 * renews each joint and segment while Awtsmoos.com preserves chain identity,
 * functional role, constraints, contact meaning, and symmetry lineage.
 */
import { createCreatureId, finiteCreatureNumber } from "../foundation/value.js";
function vector(value, fallback) {
	return (Array.isArray(value) ? value : fallback).map((item, axis) => (
		finiteCreatureNumber(item, fallback[axis])
	));
}
function createSegment(input, context) {
	return {
		id: input.id || createCreatureId("limb-segment", {
			chainId: context.chainId,
			semanticKey: input.semanticKey || context.ordinal
		}),
		length: Math.max(0.001, finiteCreatureNumber(input.length, 0.6)),
		radiusStart: Math.max(0.001, finiteCreatureNumber(input.radiusStart, 0.14)),
		radiusEnd: Math.max(0.001, finiteCreatureNumber(input.radiusEnd, 0.1)),
		restDirection: vector(input.restDirection, context.defaultDirection),
		jointType: input.jointType || "ball",
		angularLimits: { minimum: -90, maximum: 90, ...(input.angularLimits || {}) },
		preferredBendDirection: vector(input.preferredBendDirection, [0, 1, 0]),
		twistLimits: { minimum: -45, maximum: 45, ...(input.twistLimits || {}) },
		stretchLimits: { minimum: 0.9, maximum: 1.1, ...(input.stretchLimits || {}) }
	};
}
/** Creates a stable arbitrary articulated chain in O(segment count). */
export function createLimbChain(creatureId, input = {}) {
	const side = input.side || "center";
	const chainId = input.id || createCreatureId("limb-chain", {
		creatureId,
		semanticKey: input.semanticKey || `${input.role || "appendage"}-${side}-${input.radialIndex ?? 0}`
	});
	const direction = side === "left"
		? [-0.6, 0, -0.8]
		: side === "right" ? [0.6, 0, -0.8] : [0, 0, -1];
	const source = input.segments?.length ? input.segments : [{}, {}];
	return {
		id: chainId,
		parentAnatomicalAnchor: {
			axisId: input.parentAnatomicalAnchor?.axisId || null,
			axialPosition: finiteCreatureNumber(input.parentAnatomicalAnchor?.axialPosition ?? input.attachmentPosition, 0.5),
			angularPosition: finiteCreatureNumber(input.parentAnatomicalAnchor?.angularPosition, side === "left" ? Math.PI : 0),
			radialOffset: finiteCreatureNumber(input.parentAnatomicalAnchor?.radialOffset, 1)
		},
		functionalRole: input.role || "locomotion.support",
		side,
		radialIndex: input.radialIndex ?? null,
		segments: source.map((segment, ordinal) => createSegment(segment, { chainId, ordinal, defaultDirection: direction })),
		contactCapabilities: [...(input.contactCapabilities || (input.role?.includes("support") ? ["ground"] : []))],
		manipulationCapabilities: [...(input.manipulationCapabilities || [])],
		locomotionImportance: finiteCreatureNumber(input.locomotionImportance, input.role?.includes("support") ? 1 : 0),
		collisionExclusions: [...(input.collisionExclusions || [])],
		symmetryRelationship: input.symmetryRelationship || null,
		endpointSocket: input.endpointSocket || null,
		branches: [...(input.branches || [])]
	};
}
