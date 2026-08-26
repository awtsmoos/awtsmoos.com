// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornAttachment.js
 * @description Builds curved, tapered, optionally branching horns on any resolvable creature guide location.
 * RESPONSIBILITY: combine semantic anchors with data-driven horn morphology and renderer-neutral loft guides.
 * NON-RESPONSIBILITY: this module does not choose species anatomy, compile triangles, or load materials.
 * The Awtsmoos gives no place monopoly on strength; Awtsmoos.com lets horn become crown, shoulder spur, brow arc, tail thorn, or antler wherever a lawful anchor is revealed.
 */

import { componentLoftGuide } from './ComponentGuideFactory.js';
import { creatureMirrorPair } from './CreatureMirrorIds.js';
import { resolveCreatureAttachmentAnchor } from './CreatureAttachmentAnchor.js';
import { hornMorphologyProfile } from './HornMorphologyProfile.js';
import { createHornTineGuides } from './HornTineFactory.js';
import {
	addAttachmentVectors,
	createAttachmentBasis,
	scaleAttachmentVector
} from './AttachmentVector.js';

/**
 * Creates one arbitrary horn attachment plus optional tine and mirror lineage.
 * @param {object} guides Existing anatomy/component guide map.
 * @param {object} descriptor Target, style, scale, id, mirror, and advanced profile options.
 * @param {object} quality Creature quality budget used by loft generation.
 * @returns {object} Component additions compatible with CreatureComponentProfile.
 */
export function createHornAttachment(guides, descriptor, quality) {
	const anchor = resolveCreatureAttachmentAnchor(guides, descriptor);
	if (!anchor || !quality) {
		return empty();
	}
	const id = descriptor.id || 'custom_horn';
	const scale = finitePositive(descriptor.scale, 1);
	const profile = hornMorphologyProfile(
		descriptor.style || 'cattle',
		descriptor.profile
	);
	const scaledProfile = Object.freeze({
		...profile,
		length: profile.length * scale,
		radius: profile.radius * scale
	});
	const centerline = hornCenterline(anchor, scaledProfile);
	const guidesOut = {
		[id]: componentLoftGuide(
			centerline,
			hornRadii(centerline.length, scaledProfile.radius),
			quality,
			{
				materialId: 'horn_surface',
				radialSegments: scaledProfile.radialSegments,
				twist: scaledProfile.twist
			}
		),
		...createHornTineGuides(id, centerline, scaledProfile, quality)
	};
	return {
		guides: guidesOut,
		surfaceRoles: ['horn'],
		symmetryPairs: descriptor.mirror ? mirroredGuidePairs(guidesOut, descriptor.plane) : []
	};
}

/** Samples a smooth semantic horn curve in the anchor's stable local basis. */
function hornCenterline(anchor, profile) {
	const basis = createAttachmentBasis(anchor.direction);
	return [0, 0.2, 0.42, 0.66, 0.84, 1].map(amount => {
		const phase = profile.twist * Math.PI * amount;
		let point = addAttachmentVectors(
			anchor.point,
			scaleAttachmentVector(basis.tangent, profile.length * amount)
		);
		point = addAttachmentVectors(
			point,
			scaleAttachmentVector(basis.side, profile.lateral * amount * Math.sin(phase))
		);
		return addAttachmentVectors(
			point,
			scaleAttachmentVector(
				basis.up,
				profile.rise * amount + profile.bend * amount * (1 - Math.cos(phase))
			)
		);
	});
}

/** Creates a smooth taper from keratin root to a nonzero terminal tip. */
function hornRadii(count, radius) {
	return Array.from({ length: count }, (_, index) => {
		const amount = index / Math.max(1, count - 1);
		return Math.max(0.006, radius * Math.pow(1 - amount, 0.82));
	});
}

/** Creates mirror lineage for every generated horn and tine guide. */
function mirroredGuidePairs(guides, plane = 'X') {
	return Object.keys(guides).map(id => {
		return creatureMirrorPair(id, plane);
	});
}

/** Returns a positive finite scalar or its fallback. */
function finitePositive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns the empty component addition contract. */
function empty() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
