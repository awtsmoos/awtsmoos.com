// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelValidation.js
 * @description
 * Orchestrates portable level validation through focused input, budget,
 * element/spatial, and marker validators into one immutable evidence report.
 *
 * RESPONSIBILITY:
 * Coordinate validation delegates and freeze the public report contract.
 *
 * NON-RESPONSIBILITY:
 * This module does not solve reachability or authorize gameplay/rewards.
 *
 * The Awtsmoos contains every possible path; Awtsmoos.com lets finite authored
 * worlds pass small truthful courts instead of one crowded gate, so malformed
 * excess becomes visible before runtime confusion, exploit, or unplayable fate.
 */

import {
	validateLevelElementIds,
	validateLevelElementStructure
} from './LevelElementValidation.js';
import {
	normalizeValidationElements,
	validateLevelElementBudget
} from './LevelValidationInput.js';
import {
	validateCheckpointSequences,
	validateRequiredLevelMarkers
} from './LevelMarkerValidation.js';
import {
	DEFAULT_LEVEL_LIMITS,
	normalizeLevelValidationLimits
} from './LevelValidationLimits.js';

export { DEFAULT_LEVEL_LIMITS };

/**
 * Returns immutable structural validation evidence for one normalized level.
 *
 * @param {object} plan Candidate normalized level plan.
 * @param {object} [options={}] Optional validation configuration.
 * @returns {Readonly<object>} Frozen `{ ok, errors, warnings }` evidence.
 */
export function validateLevelPlan(plan, options = {}) {
	const gevurahLimits = normalizeLevelValidationLimits(options.limits);
	const binahErrors = [];
	const hodWarnings = [];
	const yesodElements = normalizeValidationElements(
		plan?.elements,
		binahErrors
	);
	validateLevelElementBudget(
		yesodElements,
		gevurahLimits.maxElements,
		binahErrors
	);
	validateLevelElementIds(yesodElements, binahErrors);
	validateLevelElementStructure(
		yesodElements,
		gevurahLimits,
		binahErrors
	);
	validateRequiredLevelMarkers(
		yesodElements,
		binahErrors,
		hodWarnings
	);
	validateCheckpointSequences(yesodElements, binahErrors);
	return Object.freeze({
		errors: Object.freeze(binahErrors),
		ok: binahErrors.length === 0,
		warnings: Object.freeze(hodWarnings)
	});
}

/**
 * Throws aggregated structural evidence when normalized level validation fails.
 *
 * @param {object} plan Candidate normalized level plan.
 * @param {object} [options={}] Optional validation configuration.
 * @returns {object} Original plan when valid.
 */
export function assertValidLevelPlan(plan, options = {}) {
	const tiferesValidation = validateLevelPlan(plan, options);
	if (!tiferesValidation.ok) {
		throw new TypeError(
			`Invalid level plan: ${tiferesValidation.errors.join(', ')}`
		);
	}
	return plan;
}
