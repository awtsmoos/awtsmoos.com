// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornTineFactory.js
 * @description Creates deterministic antler and fork tines from an already-resolved parent horn centerline.
 * RESPONSIBILITY: derive small branching loft guides without coupling the primary horn builder to branch bookkeeping.
 * NON-RESPONSIBILITY: this module does not choose horn style, anatomy anchors, or bilateral symmetry.
 * The Awtsmoos lets one branch reveal another without division in the Source; Awtsmoos.com gives each tine its own small vessel so antlers may grow without a monolithic horn file.
 */

import { componentLoftGuide } from './ComponentGuideFactory.js';
import {
	addAttachmentVectors,
	createAttachmentBasis,
	normalizeAttachmentVector,
	scaleAttachmentVector
} from './AttachmentVector.js';

/**
 * Creates named tine guides branching from the supplied horn curve.
 * @param {string} hornId Parent horn semantic id.
 * @param {Array<Array<number>>} centerline Parent horn points.
 * @param {object} profile Horn morphology profile containing tine count and scale.
 * @param {object} quality Creature quality budget.
 * @returns {object} Plain guide map suitable for merging into component output.
 */
export function createHornTineGuides(hornId, centerline, profile, quality) {
	const guides = {};
	const count = Math.max(0, Math.floor(profile.tines || 0));
	for (let index = 0; index < count; index += 1) {
		const fraction = (index + 2) / (count + 3);
		const rootIndex = Math.min(
			centerline.length - 2,
			Math.max(1, Math.round(fraction * (centerline.length - 1)))
		);
		const root = centerline[rootIndex];
		const previous = centerline[rootIndex - 1];
		const tangent = normalizeAttachmentVector(root.map((value, axis) => {
			return value - previous[axis];
		}));
		const basis = createAttachmentBasis(tangent);
		const tip = tineTip(root, basis, profile, index);
		guides[`${hornId}_tine_${index + 1}`] = componentLoftGuide(
			[root, tip],
			[profile.radius * 0.42, 0.006],
			quality,
			{
				materialId: 'horn_surface',
				radialSegments: 8
			}
		);
	}
	return guides;
}

/** Derives a tine tip from the local parent frame and deterministic index spread. */
function tineTip(root, basis, profile, index) {
	const reach = profile.length * (0.2 + index * 0.035);
	let tip = addAttachmentVectors(
		root,
		scaleAttachmentVector(basis.tangent, reach * 0.35)
	);
	tip = addAttachmentVectors(
		tip,
		scaleAttachmentVector(basis.side, reach * (0.7 + index * 0.12))
	);
	return addAttachmentVectors(
		tip,
		scaleAttachmentVector(basis.up, reach * 0.55)
	);
}
