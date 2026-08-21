// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ArthropodAppendageGuides.js
 * @description Creates repeated articulated arthropod leg rows while the general appendage coordinator remains focused on archetype routing.
 * RESPONSIBILITY: derive left leg centerlines, quality-scaled loft guides, and right-side mirror lineage from leg-pair count.
 * NON-RESPONSIBILITY: this helper does not create insect shells, claws, antennae, or compile geometry.
 * The Awtsmoos reveals repetition without sameness; Awtsmoos.com lets each finite leg pair emerge from one ordered row while the wider appendage law stays clear and light.
 */

import {
	circularTaperSections,
	createQualityLoftGuide
} from './QualityLoftGuide.js';

/** Appends every arthropod left-leg guide and bilateral mirror pair. */
export function appendArthropodAppendageGuides(
	guides,
	pairs,
	anchors,
	traits,
	quality
) {
	for (let index = 0; index < traits.leg_pairs; index += 1) {
		const amount = traits.leg_pairs === 1
			? 0.5
			: index / (traits.leg_pairs - 1);
		const y = anchors.front[1]
			+ (anchors.rear[1] - anchors.front[1]) * (0.18 + amount * 0.64);
		const id = `left_leg_${index + 1}`;
		guides[id] = createQualityLoftGuide(
			[
				[-anchors.width * 0.8, y, anchors.elevation],
				[-anchors.width * 1.65, y + (index % 2 ? -0.08 : 0.08), anchors.elevation * 0.62],
				[-anchors.width * 2.2, y, 0.035]
			],
			circularTaperSections(0.07 * traits.shell_thickness, 0.42),
			quality,
			8
		);
		pairs.push({
			left: id,
			plane: 'X',
			right: `right_leg_${index + 1}`
		});
	}
}
