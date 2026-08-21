// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendageGuides.js
 * @description Creates quality-scaled paired legs, arms, wings, and fins while specialist helpers own repeated arthropod rows.
 * RESPONSIBILITY: derive common left appendage centerlines and explicit right-side mirror lineage from body anchors.
 * NON-RESPONSIBILITY: this file does not add feet, horns, feathers, arthropod row logic, or compile mesh buffers.
 * The Awtsmoos reveals paired motion from one bounded body; Awtsmoos.com lets every common limb share one loft law while specialist abundance stays in its rightful vessel.
 */

import { appendArthropodAppendageGuides } from './ArthropodAppendageGuides.js';
import {
	circularTaperSections,
	createQualityLoftGuide
} from './QualityLoftGuide.js';

/** Creates paired appendage guides for one morphology archetype. */
export function createAppendagePhenotypeGuides(profile, anchors, quality) {
	const id = profile.archetype_id;
	const traits = profile.genome.traits;
	const guides = {};
	const symmetryPairs = [];
	if (id === 'quadruped') {
		paired(guides, symmetryPairs, 'front_left_leg', leg(anchors, traits, anchors.front[1] + 0.18, quality));
		paired(guides, symmetryPairs, 'rear_left_leg', leg(anchors, traits, anchors.rear[1] - 0.08, quality, 1.08));
	} else if (id === 'biped') {
		paired(guides, symmetryPairs, 'left_leg', leg(anchors, traits, 0, quality));
		paired(guides, symmetryPairs, 'left_arm', arm(anchors, traits, quality));
	} else if (id === 'avian') {
		paired(guides, symmetryPairs, 'left_wing', wing(anchors, traits, quality));
		paired(guides, symmetryPairs, 'left_leg', leg(anchors, traits, anchors.rear[1] + 0.25, quality, 0.72));
	} else if (id === 'fish') {
		paired(guides, symmetryPairs, 'left_pectoral_fin', fin(anchors, traits, anchors.front[1] - 0.3, quality));
		paired(guides, symmetryPairs, 'left_pelvic_fin', fin(anchors, traits, anchors.rear[1] + 0.35, quality));
	} else if (id === 'arthropod') {
		appendArthropodAppendageGuides(
			guides,
			symmetryPairs,
			anchors,
			traits,
			quality
		);
	}
	return {
		guides,
		symmetryPairs
	};
}

function paired(guides, pairs, left, guide) {
	guides[left] = guide;
	pairs.push({
		left,
		plane: 'X',
		right: left.replace('left', 'right')
	});
}

function leg(anchors, traits, rootY, quality, lengthScale = 1) {
	const x = -Math.max(0.12, anchors.width * traits.stance_width);
	const root = [x, rootY, anchors.elevation];
	const knee = [
		x * 1.08,
		rootY + anchors.depth * 0.16,
		Math.max(0.24, anchors.elevation * 0.5)
	];
	const foot = [x * 0.92, rootY + anchors.depth * 0.28, 0.04];
	return appendageGuide(
		[root, knee, foot],
		0.12 * traits.appendage_thickness * lengthScale,
		traits.appendage_taper,
		quality
	);
}

function arm(anchors, traits, quality) {
	const x = -anchors.width * 0.86;
	const z = anchors.elevation + anchors.depth * 0.2;
	return appendageGuide([
		[x, 0, z],
		[x - 0.28 * traits.arm_length, 0.02, z - 0.28 * traits.arm_length],
		[x - 0.46 * traits.arm_length, 0.06, z - 0.52 * traits.arm_length]
	], 0.1 * traits.appendage_thickness, 0.5, quality);
}

function wing(anchors, traits, quality) {
	const z = anchors.elevation + anchors.depth * 0.15;
	return appendageGuide([
		[-anchors.width * 0.78, 0.15, z],
		[-anchors.width - 0.62 * traits.wing_span, 0.02, z + 0.12],
		[-anchors.width - 1.15 * traits.wing_span, -0.08, z + 0.02]
	], 0.14 * traits.feather_length, 0.16, quality, 12);
}

function fin(anchors, traits, rootY, quality) {
	return appendageGuide([
		[-anchors.width * 0.7, rootY, anchors.elevation],
		[-anchors.width - 0.35 * traits.fin_area, rootY - 0.08, anchors.elevation - 0.04],
		[-anchors.width - 0.58 * traits.fin_area, rootY - 0.18, anchors.elevation - 0.08]
	], 0.09 * traits.appendage_thickness, 0.12, quality, 9);
}

function appendageGuide(centerline, rootRadius, tipScale, quality, radial = 10) {
	return createQualityLoftGuide(
		centerline,
		circularTaperSections(rootRadius, tipScale),
		quality,
		radial
	);
}
