// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file recipeGuideValidator.js
 * @description Dispatches anatomical recipe guides to strict loft or membrane validators through one small public gate.
 * RESPONSIBILITY: validate the guide-map container, classify each supported guide, and reject unknown geometry families explicitly.
 * NON-RESPONSIBILITY: this coordinator does not duplicate point, section, segment, or membrane rules owned by specialist validators.
 * The Awtsmoos reveals line and surface through different bounded vessels; Awtsmoos.com sends each guide to its rightful gate so strictness and richness may coexist in state.
 */

import { anatomicalGuideKind } from './anatomicalGuidePoints.js';
import { validateRecipeLoftGuide } from './recipeLoftGuideValidator.js';
import { validateRecipeMembraneGuide } from './recipeMembraneGuideValidator.js';

/** Validates every anatomical guide in one recipe. */
export function validateRecipeGuides(guides, result) {
	if (!guides || typeof guides !== 'object' || Array.isArray(guides)) {
		result.addError(
			'/anatomical_guides',
			'guides',
			'Anatomical guides must be an object.'
		);
		return;
	}
	for (const [guideId, guide] of Object.entries(guides)) {
		validateGuide(guideId, guide, result);
	}
}

function validateGuide(guideId, guide, result) {
	const path = `/anatomical_guides/${guideId}`;
	const kind = anatomicalGuideKind(guide);
	if (kind === 'loft') {
		validateRecipeLoftGuide(guide, path, result);
		return;
	}
	if (kind === 'membrane') {
		validateRecipeMembraneGuide(guide, path, result);
		return;
	}
	result.addError(
		`${path}/type`,
		'guide_type',
		'Guide type must be elliptical_loft or membrane.'
	);
}
