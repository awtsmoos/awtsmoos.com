//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosPlan.js
 * @description Seals canonical Definition, validation, artifact intent, compiler coverage, constraint planning, and pipeline evidence into one deterministic universal plan.
 * The Awtsmoos renews every measured consequence before Binah can gather them beneath one hash;
 * Awtsmoos.com keeps planning portable and executor-free while preserving the established compilerChain and constraints contract used by compilation and cache identity.
 */
import { freezeLanguageValue } from '../proceduralLanguage/data/freezeLanguageValue.js';
import { stableLanguageHash } from '../proceduralLanguage/data/stableLanguageValue.js';

export const AWTSMOOS_PLAN_SCHEMA = 'awtsmoos.universal-plan';
export const AWTSMOOS_PLAN_VERSION = 1;

/**
 * @description Creates one deterministic portable lifecycle plan from already-computed authorities.
 * @param {object} input Canonical definition, validation, request, compiler, constraint, and pipeline evidence.
 * @returns {Readonly<object>} Immutable hash-bound universal plan with legacy-compatible execution fields.
 */
export function createAwtsmoosPlan(input = {}) {
	const compilerChain = input.compilerChain || input.compilerPlan || {};
	const constraints = input.constraints || input.constraintPlan || {};
	const core = freezeLanguageValue({
		schema: AWTSMOOS_PLAN_SCHEMA,
		version: AWTSMOOS_PLAN_VERSION,
		definition: input.definition,
		validation: input.validation,
		request: input.request,
		compilerChain,
		constraints,
		compilerPlan: compilerChain,
		constraintPlan: constraints,
		pipeline: input.pipeline,
		valid: input.validation?.valid === true
	});
	return freezeLanguageValue({
		...core,
		planHash: stableLanguageHash(core)
	});
}
