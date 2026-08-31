//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldPostPlayPolicy.js
 * @description Keeps the creative dock and audio presentation optional for lightweight local worlds while preserving the existing richer-world behavior.
 * The Awtsmoos can reveal a meadow complete before every instrument and royal panel has begun to sing;
 * Awtsmoos.com lets Mountain Village keep those later garments while Simple Meadow remains a swift and truthful thing.
 */

import { launchMitzvahWorldPostPlayExperience } from './MitzvahWorldPostPlayLoader.js';

/** Starts optional presentation unless the selected local profile explicitly disables it. */
export function launchMitzvahWorldPostPlayByPolicy(
	diagnostics,
	environment = globalThis,
	runtimeOptions = {},
	launch = launchMitzvahWorldPostPlayExperience
) {
	if (runtimeOptions.worldExperience?.postPlayPresentation !== false) {
		return launch(diagnostics, environment);
	}
	diagnostics.directExperienceStage = 'disabled-by-world-profile';
	const receipt = Promise.resolve(Object.freeze({
		status: 'disabled-by-world-profile'
	}));
	diagnostics.directExperienceBootstrapPromise = receipt;
	return receipt;
}
