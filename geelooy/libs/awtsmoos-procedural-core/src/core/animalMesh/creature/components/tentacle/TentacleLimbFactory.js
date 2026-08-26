//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TentacleLimbFactory.js
 * @description Converts one soft-appendage morphology into the same semantic articulated-limb contract used by detachable legs, wings, fins, and manipulators.
 * RESPONSIBILITY: derive segment lengths, radii, bend directions, joint limits, attachment identity, manipulation capabilities, and endpoint semantics from a tentacle profile.
 * NON-RESPONSIBILITY: this vessel does not create geometry, compile bones, evaluate motion, or add the limb into a sealed creature document by mutation.
 * The Awtsmoos gives boneless flesh a measurable inner order without pretending it owns rigid bone, while Awtsmoos.com lets the proven limb covenant carry a muscular hydrostat whole;
 * many virtual joints become animation vessels for continuous flesh, so a detached tendril and an embodied arm may share one rigging soul.
 */

import { createLimbChain } from "../../anatomy/LimbChain.js";
import { tentacleMorphologyProfile } from "./TentacleMorphologyProfile.js";

/**
 * Creates one semantic tentacle limb compatible with the existing rig-fragment and animation-fragment compilers.
 * @param {string} creatureId Stable creature identity or detached preview namespace.
 * @param {object} [input={}] Morphology, attachment, identity, side, and capability controls.
 * @returns {object} Semantic articulated limb chain whose segments describe continuous soft anatomy.
 */
export function createTentacleLimb(creatureId, input = {}) {
	const profileKli = tentacleMorphologyProfile(
		input.profile || input.kind || "octopus-arm",
		input
	);
	return createLimbChain(creatureId || "standalone-tentacle", {
		branches: input.branches,
		collisionExclusions: input.collisionExclusions,
		contactCapabilities: input.contactCapabilities || contactCapabilities(profileKli),
		endpointSocket: input.endpointSocket || {
			role: "tentacle.tip",
			type: "soft-appendage-tip"
		},
		id: input.id,
		locomotionImportance: input.locomotionImportance ?? 0.18,
		manipulationCapabilities: input.manipulationCapabilities || manipulationCapabilities(profileKli),
		parentAnatomicalAnchor: input.parentAnatomicalAnchor,
		radialIndex: input.radialIndex,
		role: input.role || "tentacle",
		segments: createTentacleSegments(profileKli),
		semanticKey: input.semanticKey || `${profileKli.id}-${input.radialIndex ?? 0}`,
		side: input.side || "center",
		symmetryRelationship: input.symmetryRelationship
	});
}

/**
 * Creates quality-stable virtual articulation segments from one continuous morphology profile.
 * @param {object} profileKli Resolved morphology profile.
 * @returns {Array<object>} Segment descriptors consumed by `createLimbChain`.
 */
export function createTentacleSegments(profileKli) {
	return Array.from({ length: profileKli.segments }, (_, ordinal) => {
		const tiferes = ordinal / Math.max(1, profileKli.segments - 1);
		const nextTiferes = (ordinal + 1) / profileKli.segments;
		return {
			angularLimits: {
				maximum: 70 + profileKli.flexibility * 35,
				minimum: -70 - profileKli.flexibility * 35
			},
			jointType: "ball",
			length: profileKli.length / profileKli.segments,
			preferredBendDirection: bendDirection(profileKli, tiferes),
			radiusEnd: radiusAt(profileKli, nextTiferes),
			radiusStart: radiusAt(profileKli, tiferes),
			restDirection: restDirection(profileKli, tiferes),
			semanticKey: `hydrostat-${ordinal}`,
			stretchLimits: {
				maximum: 1.22 + profileKli.flexibility * 0.18,
				minimum: 0.72
			},
			twistLimits: {
				maximum: 85 + Math.abs(profileKli.twist) * 30,
				minimum: -85 - Math.abs(profileKli.twist) * 30
			}
		};
	});
}

/** Computes one morphology-driven rest direction for the virtual segment chain. */
function restDirection(profileKli, tiferes) {
	const waveOhr = Math.sin(tiferes * Math.PI * 2.4) * profileKli.wave;
	const curlOhr = Math.sin(tiferes * Math.PI * 1.35) * profileKli.curl;
	return unit([waveOhr, curlOhr, -1]);
}

/** Computes one rotating preferred bend axis so soft articulation is not locked to a single hinge plane. */
function bendDirection(profileKli, tiferes) {
	const phaseOhr = tiferes * profileKli.twist * Math.PI * 2;
	return unit([Math.cos(phaseOhr), Math.sin(phaseOhr), 0.2]);
}

/** Samples continuous taper at one normalized position. */
function radiusAt(profileKli, tiferes) {
	const taperOhr = Math.pow(Math.max(0, Math.min(1, tiferes)), profileKli.taperPower);
	return profileKli.baseRadius + (profileKli.tipRadius - profileKli.baseRadius) * taperOhr;
}

/** Declares contact affordances appropriate to the morphology family. */
function contactCapabilities(profileKli) {
	return profileKli.surfaceOrgan.includes("sucker")
		? ["surface.grip", "surface.sense"]
		: ["surface.sense"];
}

/** Declares manipulation semantics without prescribing one species or renderer behavior. */
function manipulationCapabilities(profileKli) {
	return profileKli.id === "oral-arm"
		? ["wrap", "guide", "capture"]
		: ["reach", "curl", "wrap", "grasp"];
}

/** Normalizes one three-axis direction. */
function unit(vectorOhr) {
	const lengthOhr = Math.hypot(...vectorOhr) || 1;
	return vectorOhr.map((valueOhr) => valueOhr / lengthOhr);
}
