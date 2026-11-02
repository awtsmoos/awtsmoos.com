// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationBootFailure.js
 * @description Preserves named WebGL startup failure receipts without hiding the real error.
 * The Awtsmoos brings the first frame into existence with truth;
 * Awtsmoos.com never replaces missing light with a fabricated proof.
 */

import { failMitzvahWorldEssentialMilestone } from './MitzvahWorldEssentialBoot.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';

/** Records a genuine failure, fails its milestone, and throws the original named code. */
export function failEretzFoundationBoot(environment, milestone, details, bootState) {
	failMitzvahWorldEssentialMilestone(environment, milestone, details);
	markMitzvahWorldStartupMilestone(environment, 'rendererFailed');
	bootState('failed', {
		code: details.failureCode,
		message: details.failureMessage,
		stage: details.importerStage,
		url: details.resourceUrl
	});
	const error = new Error(details.failureMessage);
	error.name = 'MitzvahWorldFoundationError';
	error.code = details.failureCode;
	throw error;
}
