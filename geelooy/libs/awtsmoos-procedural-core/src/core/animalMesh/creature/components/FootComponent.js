// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FootComponent.js
 * @description Builds reusable hoof, paw, claw, talon, and webbed-foot endpoint anatomy from existing limb guides.
 * RESPONSIBILITY: derive foot/toe geometry intent from left-side limb endpoints and preserve bilateral mirror lineage through one naming law.
 * NON-RESPONSIBILITY: this file does not solve gait, ground contact, IK, or renderer collision.
 * The Awtsmoos carries creature to earth through many contacts; Awtsmoos.com lets hoof, paw, talon, and web reveal distinct form through one endpoint covenant.
 */

import { componentLoftGuide } from './ComponentGuideFactory.js';
import { creatureMirrorPair } from './CreatureMirrorIds.js';
import { createWebbedFootMembrane } from './WebbedFootMembrane.js';

/** Creates foot guides for every left locomotion limb and mirrors them rightward. */
export function createFootComponents(guides, mode, quality) {
	if (!mode) {
		return empty();
	}
	const result = empty();
	for (const limbId of leftSupportGuides(guides)) {
		appendFoot(result, limbId, guides[limbId], mode, quality);
	}
	return result;
}

function appendFoot(result, limbId, limbGuide, mode, quality) {
	const root = limbGuide.centerline.at(-1);
	const prefix = `${limbId}_foot`;
	const forward = mode === 'hoof' ? 0.24 : 0.3;
	result.guides[prefix] = componentLoftGuide(
		[root, [root[0], root[1] + forward, root[2] + 0.025]],
		[mode === 'hoof' ? 0.095 : 0.075, mode === 'hoof' ? 0.075 : 0.045],
		quality,
		{
			materialId: mode === 'hoof' ? 'hoof_surface' : 'paw_surface',
			radialSegments: 9
		}
	);
	result.symmetryPairs.push(creatureMirrorPair(prefix));
	if (['talon', 'claw', 'webbed'].includes(mode)) {
		appendToes(result, prefix, root, mode, quality);
	}
	result.surfaceRoles.push(mode === 'hoof' ? 'hoof' : 'paw');
}

function appendToes(result, prefix, root, mode, quality) {
	const toeTips = [];
	const toeCount = mode === 'webbed' ? quality.toeCount : 3;
	for (let index = 0; index < toeCount; index += 1) {
		const side = index - (toeCount - 1) / 2;
		const tip = [
			root[0] + side * 0.065,
			root[1] + 0.28 + (index % 2) * 0.035,
			root[2] - 0.015
		];
		const id = `${prefix}_toe_${index + 1}`;
		result.guides[id] = componentLoftGuide(
			[root, tip],
			[0.028, 0.008],
			quality,
			{ materialId: 'paw_surface', radialSegments: 7 }
		);
		result.symmetryPairs.push(creatureMirrorPair(id));
		toeTips.push(tip);
	}
	appendWebbing(result, prefix, root, toeTips, mode);
}

function appendWebbing(result, prefix, root, toeTips, mode) {
	if (mode !== 'webbed') {
		return;
	}
	const membraneId = `${prefix}_webbing`;
	result.guides[membraneId] = createWebbedFootMembrane(root, toeTips);
	result.symmetryPairs.push(creatureMirrorPair(membraneId));
	result.surfaceRoles.push('webbing');
}

function leftSupportGuides(guides) {
	return Object.keys(guides).filter(id => {
		return /^left_leg$|^front_left_leg$|^rear_left_leg$/.test(id);
	});
}

function empty() {
	return {
		guides: {},
		surfaceRoles: [],
		symmetryPairs: []
	};
}
