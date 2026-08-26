// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreaturePrimaryLofts.js
 * @description Builds deterministic torso and anatomical-limb lofts for one continuous skinned creature surface.
 * RESPONSIBILITY: preserve the established elliptical-loft contract while making limb roots uncapped and aligned with the canonical Yetzirah anchor.
 * NON-RESPONSIBILITY: this file does not cut body sockets, bridge seams, compile detail parts, bind skin weights, or execute animation.
 * The Awtsmoos renews spine and limb from one hidden measure, while Awtsmoos.com lets bone-root and skin-root meet in the same place;
 * no heuristic shadow may pull the flesh from the skeleton when one semantic anchor already reveals their common trace.
 */

import { buildEllipticalLoft } from "../../geometry/ellipticalLoft.js";
import { resolveLimbAnchor } from "../rig/compileLimbBones.js";
import {
	addVector,
	normalizeVector,
	scaleVector
} from "../shared/creatureValue.js";

const LIMB_RADIAL_SEGMENTS = 8;

/** Builds the capped structured torso loft plus grid dimensions used by socket selection. */
export function createCreatureBodyLoft(creature) {
	const sections = creature.body.sections;
	const radialSegments = bodyRadialSegments(creature);
	const longitudinalSegments = Math.max(4, (sections.length - 1) * 5);
	const geometry = buildEllipticalLoft({
		centerline: sections.map((section) => section.position),
		longitudinal_segments: longitudinalSegments,
		radial_segments: radialSegments,
		sections: sections.map((section, index) => ({
			half_height: section.ellipticalRadius[1],
			half_width: section.ellipticalRadius[0],
			rotation: section.roll,
			t: index / Math.max(1, sections.length - 1)
		}))
	}, {
		cap_end: true,
		cap_start: true
	});
	return {
		geometry,
		longitudinalSegments,
		radialSegments
	};
}

/** Builds one anatomical limb with an open root ring and a closed distal end. */
export function createCreatureLimbLoft(creature, limb) {
	if (!limb.segments?.length) {
		throw new Error(`B"H | Limb ${limb.id} requires at least one segment.`);
	}
	let point = resolveLimbAnchor(creature, limb);
	const centerline = [[...point]];
	for (const segment of limb.segments) {
		point = addVector(
			point,
			scaleVector(normalizeVector(segment.restDirection), segment.length)
		);
		centerline.push([...point]);
	}
	const sections = [{
		half_height: limb.segments[0].radiusStart,
		half_width: limb.segments[0].radiusStart,
		rotation: 0,
		t: 0
	}];
	limb.segments.forEach((segment, index) => sections.push({
		half_height: segment.radiusEnd,
		half_width: segment.radiusEnd,
		rotation: 0,
		t: (index + 1) / limb.segments.length
	}));
	return {
		anchor: [...centerline[0]],
		geometry: buildEllipticalLoft({
			centerline,
			longitudinal_segments: Math.max(4, (centerline.length - 1) * 5),
			radial_segments: LIMB_RADIAL_SEGMENTS,
			sections
		}, {
			cap_end: true,
			cap_start: false
		})
	};
}

/** Expands torso circumference only when dense radial limbs require more non-overlapping socket room. */
function bodyRadialSegments(creature) {
	const radialLimbCount = creature.limbs.filter(
		(limb) => Number.isInteger(limb.radialIndex)
	).length;
	const needed = Math.max(16, radialLimbCount * 4);
	return Math.ceil(needed / 8) * 8;
}
