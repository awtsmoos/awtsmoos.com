//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosExplanation.js
 * @description Summarizes one universal plan into serializable compiler, constraint, pipeline, support, and artifact-intent evidence without running compilers or solvers.
 * The Awtsmoos renews meaning before Hod can explain what Binah has measured;
 * Awtsmoos.com lets explanation reveal support and uncertainty while executable power remains safely severed.
 */
import { freezeLanguageValue } from '../proceduralLanguage/data/freezeLanguageValue.js';
import { stableLanguageHash } from '../proceduralLanguage/data/stableLanguageValue.js';

export const AWTSMOOS_EXPLANATION_SCHEMA = 'awtsmoos.universal-explanation';

/**
 * @description Creates one deterministic portable explanation from an existing universal plan.
 * @param {Readonly<object>} plan Universal plan produced by createAwtsmoosPlan.
 * @returns {Readonly<object>} Frozen explainability receipt.
 */
export function createAwtsmoosExplanation(plan) {
	const compilerPlan = plan.compilerPlan || {};
	const constraintPlan = plan.constraintPlan || {};
	const core = freezeLanguageValue({
		schema: AWTSMOOS_EXPLANATION_SCHEMA,
		version: 1,
		planHash: plan.planHash,
		definition: {
			id: plan.definition?.id ?? null,
			kind: plan.definition?.kind ?? null
		},
		valid: plan.valid,
		request: plan.request,
		compiler: {
			complete: compilerPlan.complete === true,
			accepted: compilerPlan.accepted || [],
			rejected: compilerPlan.rejected || [],
			missingRequiredChannels: compilerPlan.missingRequiredChannels || []
		},
		constraints: {
			complete: constraintPlan.complete !== false,
			planned: constraintPlan.items || constraintPlan.plan || []
		},
		pipeline: plan.pipeline
	});
	return freezeLanguageValue({
		...core,
		explanationHash: stableLanguageHash(core)
	});
}
